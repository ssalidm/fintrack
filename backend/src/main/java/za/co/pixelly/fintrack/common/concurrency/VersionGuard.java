package za.co.pixelly.fintrack.common.concurrency;

import java.util.Objects;
import java.util.function.Supplier;

public final class VersionGuard {

    private VersionGuard() {
    }

    public static void requireCurrent(
        long currentVersion,
        Long requestedVersion,
        Supplier<? extends RuntimeException> exceptionSupplier
    ) {
        Objects.requireNonNull(
            exceptionSupplier,
            "exceptionSupplier"
        );

        if (requestedVersion == null
            || currentVersion
            != requestedVersion
        ) {
            throw exceptionSupplier.get();
        }
    }
}
