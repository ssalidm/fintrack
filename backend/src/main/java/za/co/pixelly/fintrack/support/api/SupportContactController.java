package za.co.pixelly.fintrack.support.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import za.co.pixelly.fintrack.support.application.SupportContactService;

@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
public class SupportContactController {

    private final SupportContactService supportContactService;


    @PostMapping("/contact")
    public ResponseEntity<Void> contact(
        @Valid
        @RequestBody
        SupportContactRequest request,
        HttpServletRequest httpRequest
    ) {
        supportContactService.submit(
            request,
            httpRequest.getRemoteAddr()
        );

        return ResponseEntity
            .noContent()
            .build();
    }
}
