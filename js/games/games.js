$(document).ready(function() {

    if (typeof toastr !== 'undefined') {
        // 使用 extend 只修改部分配置
        toastr.options = $.extend(toastr.options, {
            timeOut: 2500,
            positionClass: 'toast-top-center'
        });
    }

    $('#app').on('click', '.game_pic', function () {
        // 创建一个模态框来显示放大的图片
        let modal = $('<div class="modal fade" id="modalZoomImage" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"></div>');
        let pic = $('<div class="modal-dialog" role="document"></div>');
        pic.append($('<div class="modal-content"></div>'));
        pic.append($('<div class="modal-body"></div>'));
        pic.append('<img src="' + $(this).find('img').attr('src') + '" style="max-width:100%;"/>');
        //let pic = '<div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-body"><img src="' + $(this).find('img').attr('src') + '" style="width:100%;"/></div></div></div>';
        modal.append(pic);
        $("body").append(modal);
        modal.modal('show'); // 显示模态框
    })

    $(document).off('click', ".see-password").on('click', '.see-password', function () {
        let target = $(this).closest('.input-group').find("input");
        let type = $(target).css('-webkit-text-security');
        let type2 = $(target).css('text-security');
        $(target).css('-webkit-text-security', type=='disc'?'none':'disc');
        $(target).css('text-security', type2=='disc'?'none':'disc');
        if(type == 'none') {
            $(this).removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            $(this).removeClass('fa-eye-slash').addClass('fa-eye');
        }
    })
})
