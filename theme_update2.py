def replace_in_file(filepath, old, new):
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

# billing page fixes
replace_in_file('app/dashboard/billing/client-page.tsx', '"#f4f4f5"', '"rgba(255,255,255,0.05)"')
replace_in_file('app/dashboard/billing/client-page.tsx', 'color: isPro ? "#fff" : "#fafafa"', 'color: "#fafafa"')

# main dashboard fixes
replace_in_file('app/dashboard/client-page.tsx', '"#f4f4f5"', '"rgba(255,255,255,0.05)"')
replace_in_file('app/dashboard/client-page.tsx', 'color: "#3f3f46"', 'color: "#e4e4e7"')
replace_in_file('app/dashboard/client-page.tsx', 'color: "#18181b"', 'color: "#fafafa"')
replace_in_file('app/dashboard/client-page.tsx', 'color: "#0a0a0a"', 'color: "#fafafa"')
replace_in_file('app/dashboard/client-page.tsx', 'background: "#fafafa"', 'background: "rgba(255,255,255,0.01)"')
print("Fixes applied")
