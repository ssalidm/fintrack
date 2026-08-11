package za.co.pixelly.fintrack.config.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;
import za.co.pixelly.fintrack.common.api.ApiResponse;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final JsonMapper jsonMapper;

    @Override
    public void handle(@NonNull HttpServletRequest request,
                       @NonNull HttpServletResponse response,
                       @NonNull AccessDeniedException accessDeniedException
    ) throws IOException, ServletException {

        response.setStatus(HttpStatus.FORBIDDEN.value());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        response.setCharacterEncoding("UTF-8");

        ApiResponse<Void> body =
            ApiResponse.error(
                HttpStatus.FORBIDDEN.value(),
                "Access denied"
            );

        response.getWriter().write(
            jsonMapper.writeValueAsString(body)
        );
    }
}
