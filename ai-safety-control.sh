#!/bin/bash
# AI Safety Control Script
# Quick access to start, stop, and status commands

case "$1" in
    start)
        echo "🚀 Starting AI Safety System..."
        ./tools/scripts/start_local.sh
        ;;
    stop)
        echo "🛑 Stopping AI Safety System..."
        ./tools/scripts/stop_local.sh
        ;;
    status)
        echo "📊 Checking AI Safety System Status..."
        ./tools/scripts/status_check.sh
        ;;
    restart)
        echo "🔄 Restarting AI Safety System..."
        ./tools/scripts/stop_local.sh
        sleep 3
        ./tools/scripts/start_local.sh
        ;;
    *)
        echo "AI Safety Control Script"
        echo ""
        echo "Usage: $0 {start|stop|status|restart}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the entire AI Safety system"
        echo "  stop    - Stop the entire AI Safety system"
        echo "  status  - Check status of all services"
        echo "  restart - Restart the entire system"
        echo ""
        echo "Examples:"
        echo "  ./ai-safety-control.sh start"
        echo "  ./ai-safety-control.sh status"
        echo "  ./ai-safety-control.sh stop"
        exit 1
        ;;
esac

