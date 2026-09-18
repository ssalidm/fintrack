package za.co.pixelly.fintrack.support.api;

public enum SupportTopic {

    ACCOUNT_ACCESS("Account access"),
    SECURITY("Security"),
    TECHNICAL_ISSUE("Technical issue"),
    DATA_PRIVACY("Data and privacy"),
    FEEDBACK("Feedback"),
    GENERAL("General question");


    private final String label;

    SupportTopic(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
