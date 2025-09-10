#!/bin/bash

# 🔐 BLAZE INTELLIGENCE SSL & CLOUDFLARE VERIFICATION SCRIPT
# Pattern Recognition Weaponized™

echo "🔐 BLAZE INTELLIGENCE SSL & CLOUDFLARE VERIFICATION"
echo "================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test domains
DOMAINS=("blaze-intelligence.com" "www.blaze-intelligence.com" "blaze-intelligence.pages.dev")

echo "🌐 TESTING DOMAIN ACCESSIBILITY"
echo "==============================="

for domain in "${DOMAINS[@]}"; do
    echo -n "Testing $domain: "
    
    # Test HTTP status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$domain" 2>/dev/null)
    response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "https://$domain" 2>/dev/null)
    
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✅ $status OK${NC} (${response_time}s)"
    elif [ "$status" = "403" ]; then
        echo -e "${YELLOW}⚠️  $status FORBIDDEN${NC} (${response_time}s)"
    elif [ "$status" = "000" ]; then
        echo -e "${RED}❌ CONNECTION FAILED${NC}"
    else
        echo -e "${YELLOW}⚠️  $status${NC} (${response_time}s)"
    fi
done

echo ""
echo "🔐 SSL CERTIFICATE VERIFICATION"
echo "==============================="

for domain in "${DOMAINS[@]}"; do
    echo "📋 Checking SSL for $domain:"
    
    # Get SSL certificate information
    ssl_info=$(echo | timeout 10 openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates -issuer -subject 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$ssl_info" ]; then
        echo -e "${GREEN}✅ SSL Certificate Active${NC}"
        
        # Extract certificate details
        issuer=$(echo "$ssl_info" | grep "issuer=" | cut -d'=' -f2-)
        subject=$(echo "$ssl_info" | grep "subject=" | cut -d'=' -f2-)
        not_before=$(echo "$ssl_info" | grep "notBefore=" | cut -d'=' -f2-)
        not_after=$(echo "$ssl_info" | grep "notAfter=" | cut -d'=' -f2-)
        
        echo "   Issuer: $issuer"
        echo "   Subject: $subject"
        echo "   Valid From: $not_before"
        echo "   Valid Until: $not_after"
        
        # Check if certificate is valid
        if echo | timeout 5 openssl s_client -servername "$domain" -connect "$domain:443" -verify_return_error 2>/dev/null >/dev/null; then
            echo -e "   Status: ${GREEN}✅ VALID${NC}"
        else
            echo -e "   Status: ${YELLOW}⚠️  INVALID/UNTRUSTED${NC}"
        fi
    else
        echo -e "${RED}❌ SSL Certificate Not Available${NC}"
    fi
    
    echo ""
done

echo "🌍 DNS PROPAGATION CHECK"
echo "======================="

for domain in "blaze-intelligence.com" "www.blaze-intelligence.com"; do
    echo "🔍 DNS Records for $domain:"
    
    # Check A records
    a_records=$(dig +short A "$domain" 2>/dev/null)
    if [ -n "$a_records" ]; then
        echo "   A Records:"
        echo "$a_records" | while read -r ip; do
            echo "   → $ip"
        done
    fi
    
    # Check CNAME records
    cname_records=$(dig +short CNAME "$domain" 2>/dev/null)
    if [ -n "$cname_records" ]; then
        echo "   CNAME Records:"
        echo "$cname_records" | while read -r cname; do
            echo "   → $cname"
        done
    fi
    
    # Check if pointing to Cloudflare
    if echo "$a_records" | grep -E "(104\.26\.|172\.67\.)" >/dev/null 2>&1; then
        echo -e "   Cloudflare: ${GREEN}✅ DETECTED${NC}"
    else
        echo -e "   Cloudflare: ${YELLOW}⚠️  NOT DETECTED${NC}"
    fi
    
    echo ""
done

echo "📊 PAGE RESPONSE TESTING"
echo "======================="

# Test key pages
pages=("" "intelligence-os" "swing-engine.html" "championship-os" "enterprise.html" "pricing" "contact.html")

echo "Testing pages on blaze-intelligence.pages.dev:"
for page in "${pages[@]}"; do
    if [ -z "$page" ]; then
        url="https://blaze-intelligence.pages.dev/"
        page_name="home"
    else
        url="https://blaze-intelligence.pages.dev/$page"
        page_name="$page"
    fi
    
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)
    response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$url" 2>/dev/null)
    
    echo -n "   $page_name: "
    if [ "$status" = "200" ]; then
        echo -e "${GREEN}✅ $status${NC} (${response_time}s)"
    elif [ "$status" = "308" ]; then
        echo -e "${YELLOW}🔄 $status REDIRECT${NC} (${response_time}s)"
    else
        echo -e "${RED}❌ $status${NC} (${response_time}s)"
    fi
done

echo ""
echo "🔒 SECURITY HEADERS CHECK"
echo "========================"

domain="blaze-intelligence.pages.dev"
echo "Checking security headers for $domain:"

headers=$(curl -s -I "https://$domain" --max-time 10 2>/dev/null)

if [ $? -eq 0 ]; then
    # Check for important security headers
    if echo "$headers" | grep -i "x-frame-options" >/dev/null; then
        echo -e "${GREEN}✅ X-Frame-Options${NC}"
    else
        echo -e "${YELLOW}⚠️  X-Frame-Options missing${NC}"
    fi
    
    if echo "$headers" | grep -i "x-content-type-options" >/dev/null; then
        echo -e "${GREEN}✅ X-Content-Type-Options${NC}"
    else
        echo -e "${YELLOW}⚠️  X-Content-Type-Options missing${NC}"
    fi
    
    if echo "$headers" | grep -i "strict-transport-security" >/dev/null; then
        echo -e "${GREEN}✅ HSTS Enabled${NC}"
    else
        echo -e "${YELLOW}⚠️  HSTS missing${NC}"
    fi
    
    if echo "$headers" | grep -i "content-security-policy" >/dev/null; then
        echo -e "${GREEN}✅ Content Security Policy${NC}"
    else
        echo -e "${YELLOW}⚠️  CSP missing${NC}"
    fi
else
    echo -e "${RED}❌ Unable to fetch headers${NC}"
fi

echo ""
echo "🎯 PERFORMANCE METRICS"
echo "===================="

echo "Response time analysis for key pages:"
domains_to_test=("blaze-intelligence.pages.dev")

for domain in "${domains_to_test[@]}"; do
    echo "Testing $domain:"
    
    total_time=0
    success_count=0
    
    for i in {1..3}; do
        response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "https://$domain" 2>/dev/null)
        if [ $? -eq 0 ]; then
            total_time=$(echo "$total_time + $response_time" | bc -l 2>/dev/null || echo "$total_time")
            success_count=$((success_count + 1))
        fi
    done
    
    if [ "$success_count" -gt 0 ]; then
        avg_time=$(echo "scale=3; $total_time / $success_count" | bc -l 2>/dev/null || echo "N/A")
        if [ "$avg_time" != "N/A" ] && [ $(echo "$avg_time < 0.5" | bc -l 2>/dev/null || echo 0) -eq 1 ]; then
            echo -e "   Average Response Time: ${GREEN}${avg_time}s ✅${NC}"
        elif [ "$avg_time" != "N/A" ] && [ $(echo "$avg_time < 1.0" | bc -l 2>/dev/null || echo 0) -eq 1 ]; then
            echo -e "   Average Response Time: ${YELLOW}${avg_time}s ⚠️${NC}"
        else
            echo -e "   Average Response Time: ${RED}${avg_time}s ❌${NC}"
        fi
    else
        echo -e "   Average Response Time: ${RED}FAILED${NC}"
    fi
done

echo ""
echo "📈 OVERALL HEALTH SUMMARY"
echo "========================"

# Count working pages
working_pages=0
total_pages=7

for page in "" "intelligence-os" "swing-engine.html" "championship-os" "enterprise.html" "pricing" "contact.html"; do
    if [ -z "$page" ]; then
        url="https://blaze-intelligence.pages.dev/"
    else
        url="https://blaze-intelligence.pages.dev/$page"
    fi
    
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)
    if [ "$status" = "200" ] || [ "$status" = "308" ]; then
        working_pages=$((working_pages + 1))
    fi
done

health_percentage=$(echo "scale=1; $working_pages * 100 / $total_pages" | bc -l 2>/dev/null || echo "0")

echo "🎯 BLAZE INTELLIGENCE PLATFORM HEALTH:"
echo "   Working Pages: $working_pages/$total_pages"
echo "   Health Score: $health_percentage%"

if [ $(echo "$health_percentage >= 90" | bc -l 2>/dev/null || echo 0) -eq 1 ]; then
    echo -e "   Status: ${GREEN}🏆 CHAMPIONSHIP LEVEL${NC}"
elif [ $(echo "$health_percentage >= 70" | bc -l 2>/dev/null || echo 0) -eq 1 ]; then
    echo -e "   Status: ${YELLOW}⚡ OPERATIONAL${NC}"
else
    echo -e "   Status: ${RED}❌ NEEDS ATTENTION${NC}"
fi

echo ""
echo "🏆 PATTERN RECOGNITION WEAPONIZED™"
echo "SSL and Cloudflare verification complete."
echo ""

# Save results to file
echo "💾 Saving results to ssl_verification_results.txt..."
{
    echo "BLAZE INTELLIGENCE SSL VERIFICATION RESULTS"
    echo "Generated: $(date)"
    echo "========================================"
    echo ""
    
    echo "Domain Status:"
    for domain in "${DOMAINS[@]}"; do
        status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://$domain" 2>/dev/null)
        echo "   $domain: HTTP $status"
    done
    
    echo ""
    echo "Platform Health: $health_percentage% ($working_pages/$total_pages pages working)"
    echo "Pattern Recognition Weaponized™ - Verification Complete"
    
} > ssl_verification_results.txt

echo -e "${GREEN}✅ Results saved to ssl_verification_results.txt${NC}"
echo ""