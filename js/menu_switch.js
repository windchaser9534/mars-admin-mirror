/* 侧边栏分类切换：Online Menu / Land-based Menu / Kiosk Menu
   点击左上角按钮展开分类列表；
   - 点任意分类：该分类立即显示，并被「置顶」为默认展开的分类（刷新后仍然打开它）
   - 分类右侧的图钉仅作状态指示：紫色=当前默认展开的分类 */
(function ($) {
    $(function () {
        var root = document.getElementById('menu-switcher-root');
        if (!root) { return; }

        var M = window.MARS_MENU || {};
        var $root = $(root);
        var $toggle = $('#menu-switcher-toggle', $root);
        var $list = $('#menu-switcher-list', $root);

        function closeList() {
            $list.removeClass('open');
            $root.removeClass('menu-switch-open');
        }

        function openList() {
            $list.addClass('open');
            $root.addClass('menu-switch-open');
        }

        // 展开 / 收起分类下拉
        $toggle.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if ($list.hasClass('open')) {
                closeList();
            } else {
                openList();
            }
        });

        // 选择分类：点击即「切换显示 + 置顶」，图钉只是状态指示（点它等同点整行）
        $list.on('click', 'a[data-menu-group]', function (e) {
            e.preventDefault();
            e.stopPropagation();

            var g = $(this).attr('data-menu-group');

            if (M.setPinned) {
                M.setPinned(g);          // 记住该分类，刷新后默认打开它
            }
            if (M.apply) {
                M.apply(root, g);         // 立刻切换到该分类
            }

            closeList();
        });

        // 点击别处 / 按 ESC 关闭
        $(document).on('click', function (e) {
            if (!$(e.target).closest('#menu-switcher').length) {
                closeList();
            }
        });
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                closeList();
            }
        });

        // 树形分组(System Settings / Kiosk / Converter Board)常驻展开：
        // 阻止 AdminLTE 树形插件的折叠行为(该插件在 .sidebar 上做事件委托)
        $('.sidebar-menu li.treeview > a').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });
})(jQuery);
