#!/bin/bash

echo "🔍 MONITORING blazesportsintel.com ACTIVATION"
echo "============================================="
echo "Checking every 30 seconds..."
echo "Press Ctrl+C to stop"
echo ""

while true; do
    TIMESTAMP=$(date +"%H:%M:%S")

    # Check main domain
    MAIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://blazesportsintel.com)
    WWW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.blazesportsintel.com)

    echo -ne "\r[$TIMESTAMP] blazesportsintel.com: "
    if [ "$MAIN_STATUS" == "200" ]; then
        echo -ne "✅ ACTIVE (200) "
    else
        echo -ne "⏳ Waiting ($MAIN_STATUS) "
    fi

    echo -ne "| www: "
    if [ "$WWW_STATUS" == "200" ]; then
        echo -ne "✅ ACTIVE (200) "
    else
        echo -ne "⏳ Waiting ($WWW_STATUS) "
    fi

    if [ "$MAIN_STATUS" == "200" ] && [ "$WWW_STATUS" == "200" ]; then
        echo ""
        echo ""
        echo "🎉 SUCCESS! Both domains are now active!"
        echo "✅ https://blazesportsintel.com"
        echo "✅ https://www.blazesportsintel.com"
        echo ""
        echo "Opening your live site..."
        osascript -e 'tell application "Google Chrome"
            activate
            open location "https://blazesportsintel.com"
        end tell'
        break
    fi

    sleep 30
done