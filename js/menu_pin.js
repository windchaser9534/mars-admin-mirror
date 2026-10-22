/* 侧边栏分类「置顶」逻辑
   - 置顶的分类 = 默认展开的分类，记在 localStorage，全站一致
   - 页面解析到此处时立即应用，避免刷新后先闪一下旧分类 */
(function (w, d) {
    var M = w.MARS_MENU = w.MARS_MENU || {};

    M.GROUPS = ['online', 'land', 'kiosk'];
    M.NAMES = { online: 'Online Menu', land: 'Land-based Menu', kiosk: 'Kiosk Menu' };
    M.ICONS = { online: 'fa-globe', land: 'fa-map-marker', kiosk: 'fa-bank' };
    M.PIN_KEY = 'mars_menu_pinned_group';

    M.getPinned = function () {
        try {
            var g = w.localStorage.getItem(M.PIN_KEY);
            return (g && M.NAMES[g]) ? g : 'online';   // 默认置顶 Online Menu
        } catch (e) {
            return 'online';
        }
    };

    M.setPinned = function (g) {
        try { w.localStorage.setItem(M.PIN_KEY, g); } catch (e) {}
    };

    /* 显示指定分类，并同步按钮名称/图标、图钉状态 */
    M.apply = function (root, g) {
        if (!root || !M.NAMES[g]) { return; }
        var $ = w.jQuery;
        var $root = $(root);

        $root.find('ul.menu-group').removeClass('menu-group-active');
        $root.find('ul.menu-group[data-menu-group="' + g + '"]').addClass('menu-group-active');

        $root.find('#menu-switcher-label').text(M.NAMES[g]);
        var ic = $root.find('#menu-switcher-icon');
        if (ic.length) { ic.attr('class', 'fa ' + M.ICONS[g]); }

        var pinned = M.getPinned();
        $root.find('#menu-switcher-list a[data-menu-group]').each(function () {
            var gg = $(this).attr('data-menu-group');
            $(this).find('.menu-pin').toggleClass('menu-pinned', gg === pinned);
            $(this).toggleClass('menu-current', gg === g);
        });
    };

    var root = d.getElementById('menu-switcher-root');
    if (root) { M.apply(root, M.getPinned()); }
})(window, document);
