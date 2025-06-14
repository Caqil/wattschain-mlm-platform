import os
from pathlib import Path

def create_file(path, content=""):
    """Create a file with optional content"""
    # Ensure the directory exists before creating the file
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)

def create_directory_structure():
    """Create the wattschain-mlm-platform directory structure"""
    base_dir = "wattschain-mlm-platform"
    os.makedirs(base_dir, exist_ok=True)
    
    # Root files
    root_files = [
        "README.md",
        "package.json",
        "next.config.js",
        "tailwind.config.ts",
        "postcss.config.js",
        ".env.local",
        ".env.example",
        ".gitignore",
        "tsconfig.json",
        "components.json",
        "middleware.ts",
        "docker-compose.yml"
    ]
    
    for file in root_files:
        create_file(os.path.join(base_dir, file))

    # Public directory structure
    public_dirs = [
        "public/images/payment-methods",
        "public/locales/en",
        "public/locales/sw"
    ]
    
    for dir_path in public_dirs:
        os.makedirs(os.path.join(base_dir, dir_path), exist_ok=True)
    
    public_files = {
        "public/favicon.ico": "",
        "public/logo.png": "",
        "public/wattschain-logo.svg": "",
        "public/images/kyc-verification.png": "",
        "public/images/token-icon.png": "",
        "public/locales/en/common.json": "",
        "public/locales/sw/common.json": ""
    }
    
    for file_path, content in public_files.items():
        create_file(os.path.join(base_dir, file_path), content)

    # Src directory structure
    src_dirs = [
        "src/app/(marketing)/about",
        "src/app/(marketing)/whitepaper",
        "src/app/(marketing)/legal/[type]",
        "src/app/(marketing)/contact",
        "src/app/(auth)/login",
        "src/app/(auth)/register",
        "src/app/(auth)/forgot-password",
        "src/app/(auth)/verify-email",
        "src/app/(auth)/invite/[code]",
        "src/app/(dashboard)/dashboard",
        "src/app/(dashboard)/profile",
        "src/app/(dashboard)/wallet",
        "src/app/(dashboard)/transactions",
        "src/app/(dashboard)/token-purchase/checkout",
        "src/app/(dashboard)/token-purchase/payment/[ivisethod]",
        "src/app/(dashboard)/token-purchase/success",
        "src/app/(dashboard)/affiliate/tree",
        "src/app/(dashboard)/affiliate/commissions",
        "src/app/(dashboard)/affiliate/referrals",
        "src/app/(dashboard)/affiliate/withdraw",
        "src/app/(dashboard)/kyc/verification",
        "src/app/(dashboard)/kyc/status",
        "src/app/(dashboard)/support/tickets",
        "src/app/(dashboard)/support/faq",
        "src/app/(admin)/admin/users",
        "src/app/(admin)/admin/mlm/tree-audit",
        "src/app/(admin)/admin/mlm/commissions",
        "src/app/(admin)/admin/mlm/settings",
        "src/app/(admin)/admin/transactions",
        "src/app/(admin)/admin/kyc-reviews",
        "src/app/(admin)/admin/token-pricing",
        "src/app/(admin)/admin/reports",
        "src/app/api/auth",
        "src/app/api/user",
        "src/app/api/token",
        "src/app/api/payment/mpesa/[action]",
        "src/app/api/payment/crypto/[action]",
        "src/app/api/payment/stripe/[action]",
        "src/app/api/mlm",
        "src/app/api/kyc",
        "src/app/api/admin",
        "src/app/api/webhooks/payment/[provider]",
        "src/app/api/webhooks/kyc",
        "src/components/ui",
        "src/components/layout",
        "src/components/auth",
        "src/components/dashboard",
        "src/components/token",
        "src/components/mlm",
        "src/components/kyc",
        "src/components/admin",
        "src/components/payments",
        "src/components/common",
        "src/lib",
        "src/types",
        "src/models",
        "src/hooks",
        "src/context",
        "src/store",
        "src/middleware"
    ]
    
    for dir_path in src_dirs:
        os.makedirs(os.path.join(base_dir, dir_path), exist_ok=True)
    
    src_files = {
        "src/app/globals.css": "",
        "src/app/layout.tsx": "",
        "src/app/page.tsx": "",
        "src/app/loading.tsx": "",
        "src/app/error.tsx": "",
        "src/app/not-found.tsx": "",
        "src/app/(marketing)/layout.tsx": "",
        "src/app/(marketing)/about/page.tsx": "",
        "src/app/(marketing)/whitepaper/page.tsx": "",
        "src/app/(marketing)/legal/[type]/page.tsx": "",
        "src/app/(marketing)/contact/page.tsx": "",
        "src/app/(auth)/layout.tsx": "",
        "src/app/(auth)/login/page.tsx": "",
        "src/app/(auth)/register/page.tsx": "",
        "src/app/(auth)/forgot-password/page.tsx": "",
        "src/app/(auth)/verify-email/page.tsx": "",
        "src/app/(auth)/invite/[code]/page.tsx": "",
        "src/app/(dashboard)/layout.tsx": "",
        "src/app/(dashboard)/dashboard/page.tsx": "",
        "src/app/(dashboard)/profile/page.tsx": "",
        "src/app/(dashboard)/wallet/page.tsx": "",
        "src/app/(dashboard)/transactions/page.tsx": "",
        "src/app/(dashboard)/token-purchase/page.tsx": "",
        "src/app/(dashboard)/token-purchase/checkout/page.tsx": "",
        "src/app/(dashboard)/token-purchase/payment/[method]/page.tsx": "",
        "src/app/(dashboard)/token-purchase/success/page.tsx": "",
        "src/app/(dashboard)/affiliate/page.tsx": "",
        "src/app/(dashboard)/affiliate/tree/page.tsx": "",
        "src/app/(dashboard)/affiliate/commissions/page.tsx": "",
        "src/app/(dashboard)/affiliate/referrals/page.tsx": "",
        "src/app/(dashboard)/affiliate/withdraw/page.tsx": "",
        "src/app/(dashboard)/kyc/page.tsx": "",
        "src/app/(dashboard)/kyc/verification/page.tsx": "",
        "src/app/(dashboard)/kyc/status/page.tsx": "",
        "src/app/(dashboard)/support/page.tsx": "",
        "src/app/(dashboard)/support/tickets/page.tsx": "",
        "src/app/(dashboard)/support/faq/page.tsx": "",
        "src/app/(admin)/layout.tsx": "",
        "src/app/(admin)/admin/page.tsx": "",
        "src/app/(admin)/admin/users/page.tsx": "",
        "src/app/(admin)/admin/mlm/page.tsx": "",
        "src/app/(admin)/admin/mlm/tree-audit/page.tsx": "",
        "src/app/(admin)/admin/mlm/commissions/page.tsx": "",
        "src/app/(admin)/admin/mlm/settings/page.tsx": "",
        "src/app/(admin)/admin/transactions/page.tsx": "",
        "src/app/(admin)/admin/kyc-reviews/page.tsx": "",
        "src/app/(admin)/admin/token-pricing/page.tsx": "",
        "src/app/(admin)/admin/reports/page.tsx": "",
        "src/app/api/auth/login/route.ts": "",
        "src/app/api/auth/register/route.ts": "",
        "src/app/api/auth/logout/route.ts": "",
        "src/app/api/auth/verify-email/route.ts": "",
        "src/app/api/user/profile/route.ts": "",
        "src/app/api/user/wallet/route.ts": "",
        "src/app/api/user/transactions/route.ts": "",
        "src/app/api/token/purchase/route.ts": "",
        "src/app/api/token/price/route.ts": "",
        "src/app/api/token/balance/route.ts": "",
        "src/app/api/payment/mpesa/[action]/route.ts": "",
        "src/app/api/payment/crypto/[action]/route.ts": "",
        "src/app/api/payment/stripe/[action]/route.ts": "",
        "src/app/api/mlm/tree/route.ts": "",
        "src/app/api/mlm/commissions/route.ts": "",
        "src/app/api/mlm/referrals/route.ts": "",
        "src/app/api/mlm/withdraw/route.ts": "",
        "src/app/api/mlm/validate-referral/route.ts": "",
        "src/app/api/kyc/submit/route.ts": "",
        "src/app/api/kyc/status/route.ts": "",
        "src/app/api/kyc/shuftipro-webhook/route.ts": "",
        "src/app/api/admin/users/route.ts": "",
        "src/app/api/admin/mlm/[action]/route.ts": "",
        "src/app/api/admin/transactions/route.ts": "",
        "src/app/api/admin/kyc-reviews/route.ts": "",
        "src/app/api/admin/token-pricing/route.ts": "",
        "src/app/api/admin/reports/route.ts": "",
        "src/app/api/webhooks/payment/[provider]/route.ts": "",
        "src/app/api/webhooks/kyc/shuftipro/route.ts": "",
        "src/components/ui/button.tsx": "",
        "src/components/ui/input.tsx": "",
        "src/components/ui/card.tsx": "",
        "src/components/ui/dialog.tsx": "",
        "src/components/ui/table.tsx": "",
        "src/components/ui/badge.tsx": "",
        "src/components/ui/alert.tsx": "",
        "src/components/ui/toast.tsx": "",
        "src/components/ui/select.tsx": "",
        "src/components/ui/textarea.tsx": "",
        "src/components/ui/spinner.tsx": "",
        "src/components/layout/Header.tsx": "",
        "src/components/layout/Footer.tsx": "",
        "src/components/layout/Sidebar.tsx": "",
        "src/components/layout/DashboardLayout.tsx": "",
        "src/components/auth/LoginForm.tsx": "",
        "src/components/auth/RegisterForm.tsx": "",
        "src/components/auth/ProtectedRoute.tsx": "",
        "src/components/auth/KYCStatus.tsx": "",
        "src/components/dashboard/DashboardStats.tsx": "",
        "src/components/dashboard/WalletBalance.tsx": "",
        "src/components/dashboard/RecentTransactions.tsx": "",
        "src/components/token/TokenPurchaseForm.tsx": "",
        "src/components/token/PresalePricing.tsx": "",
        "src/components/token/PaymentMethods.tsx": "",
        "src/components/mlm/ReferralTree.tsx": "",
        "src/components/mlm/CommissionTracker.tsx": "",
        "src/components/mlm/ReferralLink.tsx": "",
        "src/components/mlm/WithdrawForm.tsx": "",
        "src/components/mlm/LockPeriodDisplay.tsx": "",
        "src/components/kyc/KYCForm.tsx": "",
        "src/components/kyc/DocumentUpload.tsx": "",
        "src/components/kyc/VerificationStatus.tsx": "",
        "src/components/admin/UserManagement.tsx": "",
        "src/components/admin/MLMTreeViewer.tsx": "",
        "src/components/admin/CommissionManager.tsx": "",
        "src/components/admin/KYCReviewPanel.tsx": "",
        "src/components/admin/PresalePricingManager.tsx": "",
        "src/components/admin/TransactionMonitor.tsx": "",
        "src/components/payments/MPesaPayment.tsx": "",
        "src/components/payments/CryptoPayment.tsx": "",
        "src/components/payments/StripePayment.tsx": "",
        "src/components/common/DataTable.tsx": "",
        "src/components/common/LoadingSpinner.tsx": "",
        "src/components/common/ErrorBoundary.tsx": "",
        "src/lib/utils.ts": "",
        "src/lib/constants.ts": "",
        "src/lib/validations.ts": "",
        "src/lib/auth.ts": "",
        "src/lib/database.ts": "",
        "src/lib/payments.ts": "",
        "src/lib/kyc.ts": "",
        "src/lib/mlm.ts": "",
        "src/lib/email.ts": "",
        "src/lib/presale-pricing.ts": "",
        "src/types/index.ts": "",
        "src/types/auth.ts": "",
        "src/types/user.ts": "",
        "src/types/transaction.ts": "",
        "src/types/mlm.ts": "",
        "src/types/kyc.ts": "",
        "src/types/payment.ts": "",
        "src/types/presale.ts": "",
        "src/models/User.ts": "",
        "src/models/Transaction.ts": "",
        "src/models/MLMTree.ts": "",
        "src/models/Commission.ts": "",
        "src/models/KYC.ts": "",
        "src/models/Token.ts": "",
        "src/models/Wallet.ts": "",
        "src/models/Payment.ts": "",
        "src/models/PresaleRound.ts": "",
        "src/hooks/useAuth.ts": "",
        "src/hooks/useUser.ts": "",
        "src/hooks/useMLM.ts": "",
        "src/hooks/useTransactions.ts": "",
        "src/hooks/useKYC.ts": "",
        "src/hooks/usePayments.ts": "",
        "src/hooks/usePresalePricing.ts": "",
        "src/context/AuthContext.tsx": "",
        "src/context/UserContext.tsx": "",
        "src/context/MLMContext.tsx": "",
        "src/store/authStore.ts": "",
        "src/store/userStore.ts": "",
        "src/store/mlmStore.ts": "",
        "src/middleware/auth.ts": "",
        "src/middleware/admin.ts": "",
        "src/middleware/rateLimit.ts": ""
    }
    
    for file_path, content in src_files.items():
        create_file(os.path.join(base_dir, file_path), content)

    # Data directory
    os.makedirs(os.path.join(base_dir, "data"), exist_ok=True)
    create_file(os.path.join(base_dir, "data/presale-pricing.json"), "")

    # Docs directory
    docs_files = [
        "docs/API.md",
        "docs/MLM_LOGIC.md",
        "docs/PRESALE_ROUNDS.md"
    ]
    
    for file in docs_files:
        create_file(os.path.join(base_dir, file))

    # Tests directory
    test_dirs = [
        "tests/components",
        "tests/api",
        "tests/lib"
    ]
    
    for dir_path in test_dirs:
        os.makedirs(os.path.join(base_dir, dir_path), exist_ok=True)

if __name__ == "__main__":
    create_directory_structure()
    print("Directory structure created successfully!")