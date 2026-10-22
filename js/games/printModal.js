$(document).ready(function() {
    // 点击打印按钮
    $(document).on('click', '.print-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var key = $(this).data('key');
        var url = $(this).data('url');

        // 创建modal的唯一ID
        var modalId = 'print-modal-' + key;
        var modalElement = document.getElementById(modalId);

        // 如果modal不存在，则创建
        if (!modalElement) {
            var modalHtml = '<div class="modal fade" id="' + modalId + '" tabindex="-1" role="dialog">' +
                '<div class="modal-dialog modal-lg" role="document">' +
                '<div class="modal-content">' +
                '<div class="modal-body" style="padding: 0;">' +
                '<iframe style="width:100%; height:500px; border:none;" ' +
                'id="iframe-' + key + '" ' +
                'frameborder="0"></iframe>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<button type="button" class="btn btn-default" data-dismiss="modal">' +
                '<i class="fa fa-times"></i> Close' +
                '</button>' +
                '<button type="button" class="btn btn-primary do-print" ' +
                'data-target="iframe-' + key + '">' +
                '<i class="fa fa-print"></i> Print' +
                '</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';

            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        // 设置iframe src
        var iframe = document.getElementById('iframe-' + key);
        if (iframe) {
            iframe.src = url;
        }

        // 显示modal - 使用jQuery方式
        $('#' + modalId).modal('show');
    });

    // 委托打印事件
    $(document).on('click', '.do-print', function() {
        var iframeId = $(this).data('target');
        var iframe = document.getElementById(iframeId);
        if (iframe && iframe.contentWindow) {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } catch (e) {
                console.error('Print error:', e);
            }
        }
    });

    // Modal关闭时处理
    $(document).on('hidden.bs.modal', '.modal', function() {
        // 可选：清空iframe src
        var iframe = $(this).find('iframe')[0];
        if (iframe) {
            // iframe.src = 'about:blank';
        }
    });
});
