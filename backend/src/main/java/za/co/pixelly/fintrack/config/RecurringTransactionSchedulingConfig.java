package za.co.pixelly.fintrack.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
@EnableScheduling
public class RecurringTransactionSchedulingConfig {

    @Bean
    public Clock recurringClock(
        @Value("${fintrack.recurring.zone:Africa/Johannesburg}")
        String zone
    ) {
        return Clock.system(
            ZoneId.of(zone)
        );
    }
}
