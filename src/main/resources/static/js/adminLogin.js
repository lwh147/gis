/**
 * 作者: lwh
 * 时间: 2020.2.26
 * 描述: 管理员登陆界面的相关初始化js
 */
$(function () {
    //用来保存账号密码的cookie名称变量
    let cname = "savedAccInfo";
    //用来判断是否已设置cookie
    let isSaved = false;
    let base64_savedUserName = "";

    //调整网页大小
    resize();
    window.onresize = resize;

    //查询cookie是否存在记住的账号密码
    let base64_accInfo = getCookie(window.btoa(cname));
    if (base64_accInfo !== null) {
        //存在记住的账号密码
        let arr = base64_accInfo.split("_");
        //解码获取账号密码
        let userName = window.atob(arr[0]);
        let password = window.atob(arr[1]);
        //自动填充
        $("input[name='userNameInput']").val(userName);
        $("input[name='passwordInput']").val(password);
        isSaved = true;
        base64_savedUserName = arr[0];
    }

    //开启bootstrap工具提示插件
    $("[data-toggle='tooltip']").tooltip();

    //重置按钮的点击事件监听函数注册
    $("#resetButton").click(function () {
        $("#loginForm").data("bootstrapValidator").resetForm(true);
        //取消记住密码的选择，因为记住密码的checkbox未添加bootstrapValidator验证
        $("input[name='rememberCheckbox']").prop("checked", false);
    });

    //开启bootstrapValidator进行表单验证
    $("#loginForm").bootstrapValidator({
        message: "*输入不合法",
        feedbackIcons: {
            valid: "glyphicon glyphicon-ok",
            invalid: "glyphicon glyphicon-remove",
            validating: "glyphicon glyphicon-refresh"
        },
        fields:{
            userNameInput: {
                message: "*用户名不合法",
                validators: {
                    notEmpty: {
                        message: "*用户名不能为空"
                    },
                    stringLength: {
                        min: 6,
                        max: 10,
                        message: "*用户名长度为6-10（包含）"
                    },
                    regexp: {
                        regexp: /^[a-zA-Z0-9_.]+$/,
                        message: "*用户名只能包含字母、数字、下划线和点"
                    }
                }
            },
            passwordInput: {
                message: "密码不合法",
                validators: {
                    notEmpty: {
                        message: "*密码不能为空"
                    },
                    stringLength: {
                        min: 6,
                        max: 6,
                        message: "*密码必须为6位"
                    },
                    different: {
                        field: "userNameInput",
                        message: "*密码不能和用户名相同"
                    }
                }
            }
        }
    }).on("success.form.bv", function(e) {
        //注册表单被提交后且验证成功的事件的监听函数以使用ajax提交表单数据
        //阻止正常提交表单
        e.preventDefault();
        //获取bootstrapValidator实例
        let bv = $(e.target).data("bootstrapValidator");
        //用base64加密用户名和密码
        let base64_userName = window.btoa($("input[name='userNameInput']").val());
        let base64_password = window.btoa($("input[name='passwordInput']").val());
        let jsonStr = JSON.stringify({
            adminName: base64_userName,
            password: base64_password
        });
        //使用ajax提交表单验证用户名密码
        $.ajax({
            url: "adminValidate",
            type: "post",
            data: jsonStr,
            contentType: "application/json;charset=utf-8",
            async: false,
            dataType: "text",
            success: function (data) {
                let checkResult = data.toString();
                if (checkResult === "1"){
                    //登陆成功
                    if($("input[name='rememberCheckbox']").prop("checked")) {
                        //需要记住密码,判断是否已经设置cookie，有的话不必设置cookie
                        if (!isSaved) {
                            //没有已保存到cookie中的账户信息，设置cookie
                            let base64_cname = window.btoa(cname);
                            let base64_cvalue = base64_userName + "_" + base64_password;
                            setCookie(base64_cname, base64_cvalue, -1);
                        }else if (base64_userName !== base64_savedUserName){
                            //当前输入的账户信息与已保存到cookie中的账户信息不符，重新设置cookie保存新的账户信息
                            let base64_cname = window.btoa(cname);
                            let base64_cvalue = base64_userName + "_" + base64_password;
                            setCookie(base64_cname, base64_cvalue, -1);
                        }else {
                            //当前输入的账户信息与已保存到cookie中的账户信息相同，不必进行保存
                        }
                    }
                    //登陆成功，跳转到主页
                    $(window).attr("location", "index");
                }else if(checkResult === "0"){
                    //验证失败，加载并显示提示用户验证失败的模态框
                    let loginErrorModal = $("#loginErrorModal");
                    if (loginErrorModal.length === 0){
                        loadModals();
                        loginErrorModal = $("#loginErrorModal");
                    }
                    loginErrorModal.modal();
                    //更改用户名密码为未验证状态
                    loginErrorModal.on("hide.bs.modal", function (e) {
                        bv.updateStatus("userNameInput", "NOT_VALIDATED");
                        bv.updateStatus("passwordInput", "NOT_VALIDATED");
                    });
                }else{
                    alert("登录校验结果出错！");
                }
            },
            error: function (error) {
                alert("----ajax请求校验账号密码执行出错！错误信息如下：----\n" + error.responseText);
            }
        });
    });
});
/**
 * 作者: lwh
 * 时间: 2020.2.26
 * 描述: 设置或者删除cookie
 */
function setCookie(cname, cvalue, exhours) {
    /* ----------Cookie属性项说明----------
     * NAME=VALUE	键值对，可以设置要保存的 Key/Value，注意这里的 NAME 不能和其他属性项的名字一样
     * Expires	    过期时间，在设置的某个时间点(ms)后该 Cookie 就会失效（不指定该属性值或者属性值
     *              小于0时，cookie生命周期为会话周期；指定为0时，cookie无效，代表立即删除该cookie）
     * Domain	    生成该 Cookie 的域名，如 domain="www.baidu.com"
     * Path	        该 Cookie 是在当前的哪个路径下生成的，如 path=/wp-admin/
     * Secure	    如果设置了这个属性，那么只会在 SSH 连接时才会回传该 Cookie
     */
    let cookieStr = cname + "=" + cvalue;
    //当hours>0时，该cookie存在指定时间；等于0时代表立即删除该cookie；小于0时该cookie会存在至会话结束
    if (exhours === 0){
        cookieStr += "; expires=0";
    }else if (exhours < 0){
        cookieStr += "; expires=-1";
    }else {
        //设置到期时间
        let expires = new Date();
        expires.setTime(expires.getTime() + exhours * 60 * 60 * 1000);
        cookieStr += "; expires=" + expires.toUTCString();
    }
    //设置cookie
    document.cookie = cookieStr;
}
/**
 * 作者: lwh
 * 时间: 2020.2.26
 * 描述: 获取指定名称的cookie的value值,失败返回null
 */
function getCookie(cname) {
    //读取cookie时cookie的字符串结构为“name1=value1; name2=value2”
    let reg = new RegExp("(^| )" + cname + "=([^;]*)(;|$)");
    let cookieStr = document.cookie;
    if (cookieStr !== ""){
        let arr = cookieStr.match(reg);
        if (arr[2] !== ""){
            return arr[2];
        }
    }
    return null;
}
/**
 * 作者: lwh
 * 时间: 2020.2.27
 * 描述: 加载模态框
 */
function loadModals() {
    //加载模态框
    $.ajax({
        url: "adminLogin_modal",
        type: "get",
        async: false,
        dataType: "html",
        success: function (data) {
            $("#modalContainer").append(data);
        },
        error: function (error) {
            alert("----ajax请求加载模态框执行出错！错误信息如下：----\n" + error.responseText);
        }
    });
}
/**
 * 作者: lwh
 * 时间: 2020.3.6
 * 描述: 动态调整网页大小
 */
function resize() {
    //获取当前浏览器窗口高度
    let pageHeight = $(window).height();
    $("body").css("height", pageHeight);
}