package za.co.pixelly.fintrack.reporting.api;

import java.time.LocalDate;
import java.util.List;

public record DashboardSummaryResponse(

    LocalDate asOfDate,

    int totalAccountCount,
    int activeAccountCount,
    int archivedAccountCount,

    List<NetWorthReportResponse>
    netWorthByCurrency,

    List<MonthlyCashFlowResponse>
    currentMonthCashFlow,

    long dueRecurringTransactionCount,

    List<RecurringTransactionDueResponse>
    dueRecurringTransactions

) {
}
