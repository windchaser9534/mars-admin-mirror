// 全局 Stock 充值/兑换逻辑（由各页侧边栏 Recharge/Redeem 按钮共用）
// 依赖：jQuery、sweetalert2(Swal/swal)、toastr
$(function () {
    $(document).on('click', '.rechargeStock', function (e) {
        e.preventDefault();
        operateOnStock('recharge');
    });
    $(document).on('click', '.redeemStock', function (e) {
        e.preventDefault();
        operateOnStock('redeem');
    });

    function operateOnStock(type) {
        let show_title = '';
        let double_show_title = '';
        if (type === 'recharge') {
            show_title = 'Recharge To Account';
            double_show_title = 'Confirm Recharge To Account';
        } else {
            show_title = 'Confirm Redeem From Account';
            double_show_title = 'Confirm Redeem From Account';
        }
        Swal.fire({
            title: show_title + ': Stock($)',
            width: 800,
            input: "number",
            inputPlaceholder: '1 USD = 1 Balance(cr)',
            text: 'Enter Recharge Amount($)',
            inputAttributes: {
                min: 1,
                autocapitalize: "off",
            },
            inputValidator: (value) => {
                return !value && "You need to input one number";
            },
            showCancelButton: true,
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            confirmButtonColor: "#d33",
        }).then((result) => {
            if (!result.value) {
                return false;
            }
            swal({
                title: double_show_title + ": Stock($)  Amount($):" + result.value,
                type: "warning",
                width: 600,
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Confirm",
                showLoaderOnConfirm: true,
                cancelButtonText: "Cancel",
                preConfirm: function () {
                    return new Promise(function (resolve, reject) {
                        $.ajax({
                            method: 'post',
                            url: '/agent/stock_operate',
                            data: {
                                amount: result.value,
                                type: type
                            },
                            success: function (data) {
                                if (data.err_code) {
                                    toastr.error(data.msg);
                                    reject();
                                } else {
                                    resolve(data);
                                }
                            }
                        });
                    });
                }
            }).then(function (result) {
                var data = result.value;
                if (typeof data === 'object') {
                    if (!data.err_code) {
                        toastr.success(data.msg);
                    } else {
                        toastr.error(data.msg);
                    }
                }
                setTimeout(function () {
                    window.location.reload();
                }, 1200);
            });
        });
    }
});
