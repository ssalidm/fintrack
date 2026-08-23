package za.co.pixelly.fintrack.finance.transfer.api;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;
import za.co.pixelly.fintrack.finance.transfer.domain.TransferStatus;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class TransferQuery {

    private UUID sourceAccountId;

    private UUID destinationAccountId;

    private TransferStatus status = TransferStatus.POSTED;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;

    @Min(0)
    private int page;

    @Min(1)
    @Max(100)
    private int size = 25;

    @AssertTrue(message = "fromDate must be on or before toDate")
    public boolean isDateRangeValid() {
        if (fromDate == null || toDate == null) {
            return true;
        }

        return !fromDate.isAfter(toDate);
    }
}
