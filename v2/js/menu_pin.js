/* v2 侧边栏：三个大分类常驻，用 + / - 独立展开收起
   - 点击分类标题切换该分类；各分类互不影响
   - 展开状态记入 localStorage，翻页后保持
   - 展开后把该分类「定位」到可视区：整组放得下就整组露出，放不下就把分类标题顶到可视区顶部
   - 翻页后把当前页面对应的菜单项滚到视野中间（停在选中项）
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

    /* 取「最内层」的当前菜单项：
       treeview 的父级 li 也会带 active，直接取第一个会拿到整个分组，导致定位跑偏 */
    function activeItem() {
        var list = root.querySelectorAll('li.active');
        if (!list.length) { return null; }
        for (var i = 0; i < list.length; i++) {
            if (!list[i].querySelector('li.active')) { return list[i]; }
        }
        return list[list.length - 1];
    }

    function activeCat() {
        var li = activeItem();
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

    /* 原生滚动定位：浏览器自己决定该滚哪个容器（菜单 ul 或 main-sidebar），不用猜。
       只滚侧边栏内部，滚完把整页的滚动位置还原，避免内容区跟着跳。 */
    function scrollEl(el, block) {
        if (!el || !el.scrollIntoView) { return; }
        var wx = window.pageXOffset || 0;
        var wy = window.pageYOffset || 0;
        try {
            el.scrollIntoView({ block: block, inline: 'nearest' });
        } catch (e) {
            el.scrollIntoView(block !== 'center');   // 老浏览器只支持布尔参数
        }
        if ((window.pageYOffset || 0) !== wy || (window.pageXOffset || 0) !== wx) {
            window.scrollTo(wx, wy);
        }
    }

    /* 展开后把该分类定位到可视区：
       - 整组（标题 + 全部选项）已完整可见 → 不动
       - 否则把分类标题顶到可视区顶部：整组能放下就全露出，放不下也一定看到分类开头 */
    function revealCat(cat) {
        var hd = headerOf(cat);
        var ul = groupOf(cat);
        if (!hd || !ul || !ul.lastElementChild) { return; }

        var box = root.getBoundingClientRect();
        var h = hd.getBoundingClientRect();
        var last = ul.lastElementChild.getBoundingClientRect();
        var whole = (h.top >= box.top - 1) && (last.bottom <= box.bottom - 1);
        if (whole) { return; }

        scrollEl(hd, 'start');
    }

    /* 翻页后把当前菜单项滚进视野（垂直居中） */
    function revealActive() {
        var li = activeItem();
        if (!li) { return; }
        var box = root.getBoundingClientRect();
        var r = li.getBoundingClientRect();
        if (r.top >= box.top + 12 && r.bottom <= box.bottom - 12) { return; }   // 已看得见
        scrollEl(li, 'center');
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
        later(function () { revealCat(cat); });
    });

    /* ---- 初始化：恢复上次展开状态 + 强制展开当前页面所属分类 ---- */
    var act = activeCat();
    var saved = loadOpen();
    if (saved) {
        for (var i = 0; i < CATS.length; i++) { setOpen(CATS[i], saved.indexOf(CATS[i]) !== -1); }
    } else if (act) {
        for (var j = 0; j < CATS.length; j++) { setOpen(CATS[j], CATS[j] === act); }
    } else {
        setOpen('online', true);
    }
    if (act) { setOpen(act, true); }
    if (!isOpen('online') && !isOpen('land') && !isOpen('kiosk')) { setOpen('online', true); }

    /* 定位当前菜单项：解析时先对一次，布局稳定后再对一次，页面完全加载后再兜一次 */
    try { revealActive(); } catch (e) {}
    later(revealActive);
    if (window.addEventListener) {
        window.addEventListener('load', function () { later(revealActive); });
    }
})();
