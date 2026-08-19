package za.co.pixelly.fintrack.finance.category.domain;

public class TemplateCategoryTypeChangeException extends RuntimeException {

    public TemplateCategoryTypeChangeException() {
        super("The type of a template-backed category cannot be change");
    }
}
