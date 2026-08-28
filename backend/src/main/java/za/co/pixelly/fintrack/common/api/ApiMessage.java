package za.co.pixelly.fintrack.common.api;

public final class ApiMessage {

    private ApiMessage() {
    }

    /*
     * AUTH
     */
    public static final class Auth {
        private Auth() {
        }

        public static final String REGISTER_SUCCESS = "User registered successfully";
        public static final String LOGIN_SUCCESS = "Login successful";
        public static final String LOGOUT_SUCCESS = "Logged out successfully";
        public static final String REFRESH_SUCCESS = "Token refreshed successfully";
        public static final String VERIFY_SUCCESS = "Email verified successfully";
        public static final String RESEND_VERIFY = "If an eligible account exists, a verification email will be sent";
        public static final String FORGOT_PASSWORD = "If an eligible account exists, password reset instructions will be sent";
        public static final String RESET_SUCCESS = "Password reset successfully. Please log in again";
    }

    /*
     * PROFILE
     */
    public static final class Profile {
        private Profile() {
        }

        public static final String FETCHED = "Profile retrieved successfully";
        public static final String UPDATED = "Profile updated successfully";
        public static final String PASSWORD_UPDATED = "Password changed successfully";
    }

    /*
     * ACCOUNTS
     */
    public static final class Account {
        private Account() {
        }

        public static final String CREATED = "Account Created Successfully";
        public static final String FETCHED = "Account retrieved successfully";
        public static final String FETCHED_ALL = "Accounts retrieved successfully";
        public static final String UPDATED = "Account updated successfully";
        public static final String ARCHIVED = "Account archived successfully";
    }

    /*
     * CATEGORIES
     */
    public static final class Category {
        private Category() {
        }

        public static final String CREATED = "Category created successfully";
        public static final String FETCHED = "Category retrieved successfully";
        public static final String FETCHED_ALL = "Categories retrieved successfully";
        public static final String UPDATED = "Category updated successfully";
        public static final String ARCHIVED = "Category archived successfully";
    }

    /*
     * TRANSACTIONS
     */
    public static final class Transaction {
        private Transaction() {
        }

        public static final String CREATED = "Transaction created successfully";
        public static final String FETCHED = "Transaction retrieved successfully";
        public static final String FETCHED_ALL = "Transactions retrieved successfully";
        public static final String UPDATED = "Transaction updated successfully";
        public static final String VOIDED = "Transaction voided successfully";
    }

    /*
     * TRANSFERS
     */
    public static final class Transfer {
        private Transfer() {
        }

        public static final String CREATED = "Transfer created successfully";
        public static final String FETCHED = "Transfer retrieved successfully";
        public static final String FETCHED_ALL = "Transfers retrieved successfully";
        public static final String VOIDED = "Transfer voided successfully";
    }

    /*
     * TRANSFERS
     */
    public static final class Budget {
        private Budget() {
        }

        public static final String CREATED = "Budget created successfully";
        public static final String FETCHED = "Budget retrieved successfully";
        public static final String FETCHED_ALL = "Budgets retrieved successfully";
        public static final String UPDATED = "Budget updated successfully";
        public static final String ARCHIVED = "Budget archived successfully";
        public static final String LIMIT_CREATED = "Budget category limit created successfully";
        public static final String LIMIT_UPDATED = "Budget category limit updated successfully";
    }


    /*
     * SAVINGS GOAL
     */
    public static final class Goal {
        private Goal() {
        }

        public static final String CREATED = "Savings goal created successfully";
        public static final String FETCHED = "Savings goal retrieved successfully";
        public static final String FETCHED_ALL = "Savings goals retrieved successfully";
        public static final String UPDATED = "Savings goals updated successfully";
        public static final String ARCHIVED = "Savings goal archived successfully";
        public static final String COMPLETED = "Savings goal completed successfully";
        public static final String CONTRIBUTION_CREATED = "Goal contribution created successfully";
        public static final String CONTRIBUTION_FETCHED_ALL = "Goal contributions retrieved successfully";
        public static final String CONTRIBUTION_FETCHED = "Goal contribution retrieved successfully";
        public static final String CONTRIBUTION_VOIDED = "Goal contribution voided successfully";
    }

    /*
     * SAVINGS GOAL
     */
    public static final class Recurring {
        private Recurring() {
        }

        public static final String CREATED = "Recurring transaction created successfully";
        public static final String FETCHED = "Recurring transaction retrieved successfully";
        public static final String FETCHED_ALL = "Recurring transactions retrieved successfully";
        public static final String UPDATED = "Recurring transaction updated successfully";
        public static final String ARCHIVED = "Recurring transaction archived successfully";
        public static final String PAUSED = "Recurring transaction paused successfully";
        public static final String RESUMED = "Recurring transaction resumed successfully";
        public static final String OCCURRENCE_POSTED = "Recurring transaction occurrence posted successfully";
    }
}
