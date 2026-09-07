package com.zzh.personal_hub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PersonalHubApplication {

	public static void main(String[] args) {
		SpringApplication.run(PersonalHubApplication.class, args);
	}

}
