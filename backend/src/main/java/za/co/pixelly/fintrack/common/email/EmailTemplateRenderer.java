package za.co.pixelly.fintrack.common.email;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import za.co.pixelly.fintrack.config.email.EmailProperties;

import java.time.Clock;
import java.time.Year;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmailTemplateRenderer {

    private final SpringTemplateEngine templateEngine;
    private final EmailProperties emailProperties;
    private final Clock applicationClock;


    public String render(
        String templateName,
        Map<String, Object> variables
    ) {
        Context context = new Context(Locale.ENGLISH);

        context.setVariables(variables);

        context.setVariable("homeUrl", emailProperties.frontendBaseUrl());
        context.setVariable("supportUrl", emailProperties.supportUrl());
        context.setVariable("privacyUrl", frontendUrl("privacy"));
        context.setVariable("termsUrl", frontendUrl("terms"));
        context.setVariable("currentYear", Year.now(applicationClock).getValue());

        return templateEngine.process(
            templateName,
            context
        );
    }

    private String frontendUrl(String pathSegment) {
        return UriComponentsBuilder
            .fromUriString(emailProperties.frontendBaseUrl())
            .pathSegment(pathSegment)
            .build()
            .toUriString();
    }
}
