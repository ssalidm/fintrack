package za.co.pixelly.fintrack.common.email;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmailTemplateRenderer {

    private final SpringTemplateEngine templateEngine;

    public String render(
        String templateName,
        Map<String, Object> variables
    ) {
        Context context = new Context(Locale.ENGLISH);

        context.setVariables(variables);

        return templateEngine.process(
            templateName,
            context
        );
    }
}
