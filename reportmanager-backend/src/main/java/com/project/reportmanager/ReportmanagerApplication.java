package com.project.reportmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = { "com.project.reportmanager.model", "com.project.reportmanager.model" })
public class ReportmanagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReportmanagerApplication.class, args);
	}

}
