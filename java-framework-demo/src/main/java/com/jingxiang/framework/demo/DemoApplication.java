package com.jingxiang.framework.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 教学应用入口。
 * jingxiang-commons 与 jingxiang-component-dict 由各自的自动配置装配。
 */
@SpringBootApplication
public class DemoApplication {

    /**
     * 启动应用。
     *
     * @param args 启动参数
     */
    static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
