package com.jingxiang.framework.demo.ms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 管理端入口。业务接口按 web/{domain} 往下加。
 */
@SpringBootApplication
public class DemoMsApplication {

    /**
     * @param args 启动参数
     */
    public static void main(String[] args) {
        SpringApplication.run(DemoMsApplication.class, args);
    }
}
