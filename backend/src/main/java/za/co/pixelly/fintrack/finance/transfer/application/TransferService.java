package za.co.pixelly.fintrack.finance.transfer.application;

import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.finance.transfer.api.CreateTransferRequest;
import za.co.pixelly.fintrack.finance.transfer.api.TransferQuery;
import za.co.pixelly.fintrack.finance.transfer.api.TransferResponse;
import za.co.pixelly.fintrack.finance.transfer.api.VoidTransferRequest;

import java.util.UUID;

public interface TransferService {

    TransferResponse create(
        UUID userId,
        CreateTransferRequest request
    );

    PageResponse<TransferResponse> findTransfers(
        UUID userId,
        TransferQuery query
    );

    TransferResponse findById(
        UUID userId,
        UUID transferId
    );

    TransferResponse voidTransfer(
        UUID userId,
        UUID transferId,
        VoidTransferRequest request
    );
}
