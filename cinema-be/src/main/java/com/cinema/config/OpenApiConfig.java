package com.cinema.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Cinema Booking System API",
                version = "3.1.0-MVP",
                description = "API tài liệu cho hệ thống đặt vé xem phim trực tuyến",
                contact = @Contact(name = "Cinema Team")
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local backend"),
                @Server(url = "http://localhost:3000", description = "Local proxy or frontend")
        },
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        type = io.swagger.v3.oas.annotations.enums.SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class OpenApiConfig {
}