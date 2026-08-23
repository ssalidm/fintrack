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
        public static final String PASSWORD_RESET = "If an eligible account exists, password reset instructions will be sent";
        public static final String RESET_SUCCESS = "Password reset successfully. Please log in again";
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
}
