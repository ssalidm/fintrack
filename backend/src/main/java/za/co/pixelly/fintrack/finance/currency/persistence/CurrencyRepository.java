package za.co.pixelly.fintrack.finance.currency.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import za.co.pixelly.fintrack.finance.currency.domain.Currency;

import java.util.Optional;

public interface CurrencyRepository extends JpaRepository<Currency, String> {

    Optional<Currency> findByCodeAndActiveTrue(String code);
}
