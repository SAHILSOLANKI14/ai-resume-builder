import re

def update_theme(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Text colors
    content = content.replace('color: "#71717a"', 'color: "#a1a1aa"')
    content = content.replace('color: "#3f3f46"', 'color: "#e4e4e7"')
    content = content.replace('color: "#52525b"', 'color: "#a1a1aa"')
    content = content.replace('color: "#18181b"', 'color: "#fafafa"')
    content = content.replace('color: "#0a0a0a"', 'color: "#fafafa"')
    
    # Backgrounds and borders
    content = content.replace('background: "#ffffff"', 'background: "rgba(255,255,255,0.02)"')
    content = content.replace('background: "#fff"', 'background: "rgba(255,255,255,0.02)"')
    content = content.replace('background: "#fafafa"', 'background: "rgba(255,255,255,0.01)"')
    content = content.replace('border: "1px solid #e4e4e7"', 'border: "1px solid rgba(255,255,255,0.08)"')
    content = content.replace('borderColor = "#e4e4e7"', 'borderColor = "rgba(255,255,255,0.08)"')
    content = content.replace('background = "#fafafa"', 'background = "rgba(255,255,255,0.01)"')
    content = content.replace('border: "2px dashed #e4e4e7"', 'border: "2px dashed rgba(255,255,255,0.15)"')
    content = content.replace('background: "#e4e4e7"', 'background: "rgba(255,255,255,0.08)"')
    content = content.replace('borderTop: "1px solid #f4f4f5"', 'borderTop: "1px solid rgba(255,255,255,0.08)"')

    # Specific colors for the new detailed sections
    content = content.replace('color: "#166534"', 'color: "#34d399"')
    content = content.replace('color: "#9f1239"', 'color: "#fb7185"')
    content = content.replace('color: "#4338ca"', 'color: "#818cf8"')
    content = content.replace('color: "#5b21b6"', 'color: "#a78bfa"')

    # Button disabled state
    content = content.replace('? "#c7c7cd"', '? "rgba(255,255,255,0.1)"')
    
    # Hover states
    content = content.replace('background = "#faf5ff"', 'background = "rgba(99,102,241,0.1)"')
    content = content.replace('background: pdfFile ? "#f0fdf4" : "#fafafa"', 'background: pdfFile ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.01)"')
    content = content.replace('borderColor: pdfFile ? "#86efac" : "#e4e4e7"', 'borderColor: pdfFile ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.15)"')
    
    # Missing keywords pill
    content = content.replace('background: "#e0e7ff"', 'background: "rgba(99,102,241,0.15)"')
    content = content.replace('color: "#4f46e5"', 'color: "#818cf8"')
    content = content.replace('border: "1px solid #c7d2fe"', 'border: "1px solid rgba(99,102,241,0.3)"')

    # White button text
    content = content.replace('color: "rgba(255,255,255,0.02)"', 'color: "#fff"') # fix any accidental overwrite

    with open(filepath, 'w') as f:
        f.write(content)

update_theme('app/dashboard/client-page.tsx')
update_theme('app/dashboard/billing/client-page.tsx')
print("Theme updated")
