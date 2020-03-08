package com.project.gis.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class PageController {

    //访问管理员登陆页面
    @RequestMapping("/adminLogin")
    public String AdminLogin() {
        return "adminLogin";
    }

    //访问主界面
    @RequestMapping("/adminIndex")
    public String AdminIndex() {
        return "adminIndex";
    }

    //加载管理员登陆页面模态框
    @RequestMapping("/adminLogin_modal")
    public String AdminLogin_modal() {
        return "adminLogin_modal";
    }

    //处理管理员登陆请求
    @RequestMapping("/adminValidate")
    @ResponseBody
    public String adminValidate(@RequestBody String jsonStr){
        System.out.println(jsonStr);
        return "0";
    }

}
