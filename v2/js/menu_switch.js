/* v2：分类展开/收起逻辑已移至 menu_pin.js（常驻标题 + / -）
   这里只保留树形分组常驻展开的拦截：阻止 AdminLTE 树形插件折叠
   (System Settings / Kiosk / Converter Board 的子项始终显示) */
(function ($) {
    $(function () {
        $('.sidebar-menu li.treeview > a').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });
})(jQuery);
