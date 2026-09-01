package za.co.pixelly.fintrack.finance.account.application;

import za.co.pixelly.fintrack.finance.account.api.AccountResponse;
import za.co.pixelly.fintrack.finance.account.api.ArchiveAccountRequest;
import za.co.pixelly.fintrack.finance.account.api.CreateAccountRequest;
import za.co.pixelly.fintrack.finance.account.api.UpdateAccountRequest;
import za.co.pixelly.fintrack.finance.account.domain.AccountStatus;

import java.util.List;
import java.util.UUID;

public interface AccountService {

    public AccountResponse create(
        UUID userId,
        CreateAccountRequest request
    );

    public List<AccountResponse> findAccounts(
        UUID userId,
        AccountStatus status
    );

    public AccountResponse findById(
        UUID userId,
        UUID accountId
    );

    public AccountResponse update(
        UUID userId,
        UUID accountId,
        UpdateAccountRequest request
    );

    public AccountResponse archive(
        UUID userId,
        UUID accountId,
        ArchiveAccountRequest request
    );
}
