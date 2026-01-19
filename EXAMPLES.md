# 📚 Usage Examples

## Toast Notifications

### Basic Usage
```typescript
import { showToast } from "@/lib/toast";

// Success message
showToast.success("User created successfully!");

// Error message
showToast.error("Failed to create user. Please try again.");

// Warning message
showToast.warning("User already exists with this email.");

// Info message
showToast.info("Processing your request...");
```

### In API Calls
```typescript
const handleCreateUser = async (data: any) => {
  try {
    await adminAPI.createUser(data);
    showToast.success("User created successfully!");
  } catch (error: any) {
    showToast.error(error.response?.data?.error || "Failed to create user");
  }
};
```

### Loading State
```typescript
const handleLongOperation = async () => {
  const toastId = showToast.loading("Processing...");
  
  try {
    await longRunningOperation();
    showToast.dismiss(toastId);
    showToast.success("Operation completed!");
  } catch (error) {
    showToast.dismiss(toastId);
    showToast.error("Operation failed!");
  }
};
```

---

## Export Functionality

### Export User Data
```typescript
import { exportToExcel, exportToCSV } from "@/lib/export";

// Export users to Excel
const handleExportUsers = () => {
  const exportData = users.map(user => ({
    Name: user.name,
    Email: user.email,
    Role: user.role,
    Plan: user.plan,
    "Created At": formatDateForExport(user.createdAt),
  }));

  exportToExcel(exportData, {
    filename: `users-${new Date().toISOString().split('T')[0]}.xlsx`,
    sheetName: "Users",
  });
  
  showToast.success("Users exported successfully!");
};

// Export to CSV
const handleExportCSV = () => {
  exportToCSV(users, {
    filename: "users.csv",
    headers: ["Name", "Email", "Role", "Plan"],
  });
};
```

### Export ESG Reports
```typescript
const handleExportESGReport = async (companyId: string) => {
  try {
    const response = await esgAPI.getReport(companyId, "json");
    const reportData = response.data;

    const exportData = [
      {
        "Company": reportData.companyName,
        "Overall Score": reportData.overallScore,
        "Environmental": reportData.environmentalScore,
        "Social": reportData.socialScore,
        "Governance": reportData.governanceScore,
        "Period": reportData.period,
      }
    ];

    exportToExcel(exportData, {
      filename: `esg-report-${companyId}.xlsx`,
      sheetName: "ESG Report",
    });

    showToast.success("ESG report exported!");
  } catch (error) {
    showToast.error("Failed to export report");
  }
};
```

---

## Skeleton Loading

### In Dashboard
```typescript
import { SkeletonKPICard } from "@/components/Skeleton";

{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <SkeletonKPICard />
    <SkeletonKPICard />
    <SkeletonKPICard />
    <SkeletonKPICard />
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <KPICard title="Companies" value={companies.length} />
    {/* ... */}
  </div>
)}
```

### In Tables
```typescript
import { SkeletonTable } from "@/components/Skeleton";

{loading ? (
  <SkeletonTable rows={10} cols={5} />
) : (
  <table>
    {/* Table content */}
  </table>
)}
```

### In Cards
```typescript
import { SkeletonCard } from "@/components/Skeleton";

{loading ? (
  <SkeletonCard />
) : (
  <div className="card">
    {/* Card content */}
  </div>
)}
```

---

## Inactivity Timeout

### Basic Usage (Already Integrated)
The inactivity timeout is already integrated in `DashboardLayout.tsx`. It:
- Detects inactivity after 25 minutes
- Shows warning after 25 minutes
- Logs out after 30 minutes total

### Custom Configuration
```typescript
import { useInactivity } from "@/hooks/useInactivity";

function MyComponent() {
  const handleLogout = () => {
    // Custom logout logic
    localStorage.clear();
    router.push("/auth/login");
  };

  useInactivity({
    timeout: 20 * 60 * 1000,      // 20 minutes
    warningTime: 3 * 60 * 1000,   // 3 minutes warning
    onLogout: handleLogout,
    enabled: true,
  });

  return <div>Content</div>;
}
```

---

## Complete Example: Admin User Management

```typescript
"use client";

import { useState, useEffect } from "react";
import { adminAPI } from "@/lib/api";
import { showToast } from "@/lib/toast";
import { exportToExcel } from "@/lib/export";
import { SkeletonTable } from "@/components/Skeleton";
import { Download } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data.users);
    } catch (error: any) {
      showToast.error(error.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: any) => {
    try {
      await adminAPI.createUser(data);
      showToast.success("User created successfully!");
      await loadUsers(); // Refresh list
    } catch (error: any) {
      showToast.error(error.response?.data?.error || "Failed to create user");
    }
  };

  const handleExport = () => {
    const exportData = users.map((user: any) => ({
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Plan: user.plan,
      "Created At": new Date(user.createdAt).toLocaleDateString(),
    }));

    exportToExcel(exportData, {
      filename: `users-${new Date().toISOString().split('T')[0]}.xlsx`,
      sheetName: "Users",
    });

    showToast.success("Users exported successfully!");
  };

  if (loading) {
    return <SkeletonTable rows={10} cols={5} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download size={20} />
          Export to Excel
        </button>
      </div>

      {/* User table */}
      <table>
        {/* Table content */}
      </table>
    </div>
  );
}
```

---

## Best Practices

### 1. Toast Notifications
- ✅ Use success for completed actions
- ✅ Use error for failures (with helpful messages)
- ✅ Use warning for important notices
- ✅ Use info for general information
- ❌ Don't show too many toasts at once
- ❌ Don't use alerts() - use toasts instead

### 2. Export
- ✅ Format dates and numbers before exporting
- ✅ Use descriptive filenames with dates
- ✅ Include headers for better readability
- ✅ Show success toast after export
- ✅ Handle errors gracefully

### 3. Loading States
- ✅ Use skeleton loaders for better UX
- ✅ Show loading state immediately
- ✅ Don't show loading for very fast operations (< 200ms)
- ✅ Use appropriate skeleton type (card, table, etc.)

### 4. Inactivity Timeout
- ✅ Keep default 25-minute timeout for security
- ✅ Show warning before logout
- ✅ Clear all user data on logout
- ✅ Redirect to login page

---

## Integration Checklist

- [x] Toast notifications installed and configured
- [x] Inactivity timeout integrated in DashboardLayout
- [x] Export utilities ready to use
- [x] Skeleton components created
- [ ] Replace alerts with toasts throughout app
- [ ] Add export buttons to data tables
- [ ] Replace spinners with skeleton loaders
- [ ] Test inactivity timeout
- [ ] Test export functionality
- [ ] Update error handling to use toasts

---

Made with 💚 for Indian SMBs

