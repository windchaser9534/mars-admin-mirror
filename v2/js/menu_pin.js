/* v2 侧边栏：三个大分类常驻，用 + / - 独立展开收起
   - 默认：Online Menu 展开，Land-based / Kiosk 收起
   - 点击分类标题切换该分类；各分类互不影响
   - 展开后自动滚动，让该分类最下面的选项完整可见（不会把分类标题滚出视野）
   - 该脚本紧跟菜单块同步执行，避免展开状态闪烁 */
(function () {
    var root = document.getElementById('menu-switcher-root');
    if (!root) { return; }
    var CATS = ['online', 'land', 'kiosk'];

    function groupOf(cat) {
        return root.querySelector('ul.menu-group[data-menu-group="' + cat + '"]');
    }

    function headerOf(cat) {
        return root.querySelector('li.menu-cat-header[data-cat="' + cat + '"]');
    }

    function setOpen(cat, open) {
        var ul = groupOf(cat);
        var hd = headerOf(cat);
        if (!ul) { return; }
        if (open) { ul.classList.add('menu-group-active'); }
        else { ul.classList.remove('menu-group-active'); }
        if (hd) {
            var ic = hd.querySelector('.menu-cat-toggle');
            if (ic) {
                ic.classList.remove('fa-plus', 'fa-minus');
                ic.classList.add(open ? 'fa-minus' : 'fa-plus');
            }
        }
    }

    /* 找出真正在滚动的容器：优先菜单 ul 自身，否则向上找 overflow-y:auto 的祖先 */
    function scroller() {
        if (root.scrollHeight - root.clientHeight > 2) { return root; }
        var el = root.parentNode;
        while (el && el !== document.body && el.nodeType === 1) {
            var oy = window.getComputedStyle(el).overflowY;
            if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight - el.clientHeight > 2) { return el; }
            el = el.parentNode;
        }
        return root;
    }

    /* 展开后滚动，让该分类的选项尽量完整展示：
       - 整组（标题 + 全部选项）能放进视野 → 标题对到容器顶部，全部可见
       - 整组放不下 → 优先保证最下面那个选项完整露出（标题可被顶上去） */
    function revealLast(cat) {
        var ul = groupOf(cat);
        var hd = headerOf(cat);
        if (!ul || !ul.lastElementChild) { return; }

        var sc = scroller();
        var view = sc.getBoundingClientRect();
        var last = ul.lastElementChild.getBoundingClientRect();
        var head = hd ? hd.getBoundingClientRect() : last;

        var viewH = view.bottom - view.top;
        var groupH = last.bottom - head.top;
        var delta;

        if (groupH <= viewH - 4) {
            // 能整组放下：已在视野内就不动，否则标题对齐到顶部
            var fits = head.top >= view.top && last.bottom <= view.bottom;
            delta = fits ? 0 : (head.top - view.top);
        } else {
            // 放不下：按“最后一项底部贴住容器底部（留 8px）”滚动
            delta = last.bottom - view.bottom + 8;
            if (delta < 0) { delta = 0; }
        }
        if (delta === 0) { return; }

        sc.scrollTop = sc.scrollTop + delta;
    }

    root.addEventListener('click', function (e) {
        var el = e.target;
        while (el && el !== root && !(el.classList && el.classList.contains('menu-cat-header'))) {
            el = el.parentNode;
        }
        if (!el || el === root) { return; }
        e.preventDefault();
        var cat = el.getAttribute('data-cat');
        var ul = groupOf(cat);
        var open = !(ul && ul.classList.contains('menu-group-active'));
        setOpen(cat, open);
        if (!open) { return; }
        // 等布局完成后再算位置（display 变化后需要一次重排）
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(function () { revealLast(cat); });
        } else {
            setTimeout(function () { revealLast(cat); }, 16);
        }
    });

    // 初始化：仅 Online 展开（初始不滚动，避免打开页面就跳动）
    for (var i = 0; i < CATS.length; i++) {
        setOpen(CATS[i], CATS[i] === 'online');
    }
})();
