package za.co.pixelly.fintrack.finance.currency.application;

public class InvalidCurrencyException
    extends RuntimeException {

    public InvalidCurrencyException(String currencyCode) {
        super(
            "Unsupported or inactive currency: "
                + currencyCode
        );
    }
}
