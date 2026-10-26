/* v2 侧边栏：三个大分类常驻，用 + / - 独立展开收起
   - 默认：Online Menu 展开，Land-based / Kiosk 收起
   - 点击分类标题切换该分类；各分类互不影响
   - 展开状态记入 localStorage，翻页后保持（停在当前页面所属分类并滚到该菜单项）
   - 展开后自动滚动，让该分类的选项尽量完整展示
   - 该脚本紧跟菜单块同步执行，避免展开状态闪烁 */
(function () {
    var root = document.getElementById('menu-switcher-root');
    if (!root) { return; }
    var CATS = ['online', 'land', 'kiosk'];
    var KEY = 'mars_v2_cat_open';

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

    function isOpen(cat) {
        var ul = groupOf(cat);
        return !!(ul && ul.classList.contains('menu-group-active'));
    }

    /* ---- 展开状态持久化 ---- */
    function loadOpen() {
        try {
            var a = JSON.parse(window.localStorage.getItem(KEY) || 'null');
            return Array.isArray(a) ? a : null;
        } catch (e) { return null; }
    }

    function saveOpen() {
        var a = [];
        for (var i = 0; i < CATS.length; i++) {
            if (isOpen(CATS[i])) { a.push(CATS[i]); }
        }
        try { window.localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
    }

    /* 当前页面所属分类（菜单里有 li.active 的那一项所在的分组） */
    function activeCat() {
        var li = root.querySelector('li.active');
        if (!li) { return null; }
        var el = li.parentNode;
        while (el && el !== root) {
            if (el.classList && el.classList.contains('menu-group')) {
                return el.getAttribute('data-menu-group');
            }
            el = el.parentNode;
        }
        return null;
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

    /* 翻页后把当前页面对应的菜单项滚到视野内（尽量居中），即“停在选中分类” */
    function revealActive() {
        var li = root.querySelector('li.active');
        if (!li) { return; }
        var sc = scroller();
        var view = sc.getBoundingClientRect();
        var r = li.getBoundingClientRect();
        var pad = 24;
        if (r.top >= view.top + pad && r.bottom <= view.bottom - pad) { return; }  // 已经看得见
        var center = (r.top + r.bottom) / 2 - (view.top + view.bottom) / 2;
        var top = sc.scrollTop + center;
        if (top < 0) { top = 0; }
        sc.scrollTop = top;
    }

    function later(fn) {
        if (window.requestAnimationFrame) {
            window.requestAnimationFrame(function () { window.requestAnimationFrame(fn); });
        } else {
            setTimeout(fn, 32);
        }
    }

    root.addEventListener('click', function (e) {
        var el = e.target;
        while (el && el !== root && !(el.classList && el.classList.contains('menu-cat-header'))) {
            el = el.parentNode;
        }
        if (!el || el === root) { return; }
        e.preventDefault();
        var cat = el.getAttribute('data-cat');
        var open = !isOpen(cat);
        setOpen(cat, open);
        saveOpen();                       // 记住这次展开/收起
        if (!open) { return; }
        later(function () { revealLast(cat); });
    });

    /* ---- 初始化：恢复上次展开状态 + 强制展开当前页面所属分类 ---- */
    var act = activeCat();
    var saved = loadOpen();
    if (saved) {
        for (var i = 0; i < CATS.length; i++) { setOpen(CATS[i], saved.indexOf(CATS[i]) !== -1); }
    } else if (act) {
        // 没有历史状态时，只展开当前页面所属的分类（而不是默认展开 Online）
        for (var j = 0; j < CATS.length; j++) { setOpen(CATS[j], CATS[j] === act); }
    } else {
        setOpen('online', true);
    }
    if (act) { setOpen(act, true); }       // 当前页面在哪一类，哪一类必开
    if (!isOpen('online') && !isOpen('land') && !isOpen('kiosk')) { setOpen('online', true); }

    later(revealActive);
})();
