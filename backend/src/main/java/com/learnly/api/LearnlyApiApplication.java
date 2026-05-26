package com.learnly.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.Set;

@SpringBootApplication
public class LearnlyApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(LearnlyApiApplication.class, args);
	}

	@Component
	static class RouteLogger implements ApplicationListener<ContextRefreshedEvent> {

		private final RequestMappingHandlerMapping handlerMapping;

		@Value("${server.port:8080}")
		private int port;

		// Rotas públicas que aparecem no log (sem token)
		private static final Set<String> PUBLIC_ROUTES = Set.of(
			"GET:/api/usuarios",
			"GET:/api/cursos",
			"GET:/api/cursos/categorias",
			"GET:/api/cursos/buscar",
			"GET:/api/cursos/categoria",
			"GET:/api/avaliacoes/cursos",
			"GET:/api/aulas/curso"
		);

		RouteLogger(RequestMappingHandlerMapping handlerMapping) {
			this.handlerMapping = handlerMapping;
		}

		private boolean isPublic(String method, String pattern) {
			return PUBLIC_ROUTES.stream().anyMatch(r -> {
				String[] parts = r.split(":", 2);
				return parts[0].equals(method) && pattern.startsWith(parts[1].replace("/**", "").replace("/*", ""));
			});
		}

		@Override
		public void onApplicationEvent(ContextRefreshedEvent event) {
			System.out.println("\n========== Learnly API - Rotas Públicas ==========");

			handlerMapping.getHandlerMethods().forEach((info, method) -> {
				var methods = info.getMethodsCondition().getMethods();
				var patterns = info.getPatternValues();

				for (String pattern : patterns) {
					if (!pattern.startsWith("/api")) continue;
					for (var httpMethod : methods) {
						if (!isPublic(httpMethod.name(), pattern)) continue;
						String url = "http://localhost:" + port + "/Learnly" + pattern;
						System.out.printf("%-8s %s%n", httpMethod, url);
					}
				}
			});

			System.out.println("==================================================\n");
		}
	}
}
