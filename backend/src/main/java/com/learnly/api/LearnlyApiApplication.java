package com.learnly.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@SpringBootApplication
public class LearnlyApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(LearnlyApiApplication.class, args);
	}

	@Component
	static class Startup {
		@Value("${server.port:8080}")
		private int port;

		@EventListener(ApplicationReadyEvent.class)
		public void onReady() {
			System.out.println("\nLearnly API rodando em http://localhost:" + port + "\n");
		}
	}
}
