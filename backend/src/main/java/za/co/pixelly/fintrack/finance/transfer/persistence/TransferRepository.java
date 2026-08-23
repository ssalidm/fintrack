package za.co.pixelly.fintrack.finance.transfer.persistence;


import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.Repository;
import za.co.pixelly.fintrack.finance.transfer.domain.Transfer;

import java.util.Optional;
import java.util.UUID;

public interface TransferRepository
    extends Repository<Transfer, UUID>,
    JpaSpecificationExecutor<Transfer> {

    Optional<Transfer> findByIdAndUserId(
        UUID id,
        UUID userId
    );
}
