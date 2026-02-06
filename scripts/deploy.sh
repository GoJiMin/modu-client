#!/bin/bash
DEPLOY_PATH="/home/ubuntu/deploy"

PROJECT_ROOT="/home/ubuntu/releases"
CURRENT_TIME=$(date "+%y-%m-%d-%H-%M-%S")
RELEASE_PATH="$PROJECT_ROOT/$CURRENT_TIME"

PM2_PATH="/home/ubuntu/.nvm/versions/node/v22.14.0/bin/pm2"

SYMLINK_PATH="/home/ubuntu/application"
PREVIOUS_RELEASE=$(readlink -f $SYMLINK_PATH)
PROJECT_NAME='Modu-Review-Client'

SLACK_SCRIPT="/home/ubuntu/utils/send_slack.sh"
LOG_FILE="/home/ubuntu/log/DeployLog_$CURRENT_TIME.log"
echo "SERVER_IP: $SERVER_IP" >> $LOG_FILE

NVM_DIR="/home/ubuntu/.nvm"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "현재 실행 중인 버전: $PREVIOUS_RELEASE" >> $LOG_FILE
echo "현재 실행 중인 포트를 확인합니다. : $CURRENT_TIME" >> $LOG_FILE
CURRENT_PORT=$(sed -n "s/^set \$service_url http:\/\/$SERVER_IP:\([0-9]*\);/\1/p" /etc/nginx/conf.d/service-url.inc)
echo "" && echo "" >> $LOG_FILE 2>&1

if [ $CURRENT_PORT -eq 3000 ]; then
    NEW_PORT=3001
    OLD_NAME="next-blue"
    NEW_NAME="next-green"
else
    NEW_PORT=3000
    OLD_NAME="next-green"
    NEW_NAME="next-blue"
fi

echo "모두의 리뷰 새로운 버전을 $NEW_PORT 포트에서 실행합니다. : $CURRENT_TIME" >> $LOG_FILE
echo "" && echo "" >> $LOG_FILE 2>&1

mv $DEPLOY_PATH $RELEASE_PATH
mkdir $DEPLOY_PATH
ln -sfn $RELEASE_PATH $SYMLINK_PATH
cd $SYMLINK_PATH

echo "필요한 의존성을 설치합니다. : $CURRENT_TIME" >> $LOG_FILE
pnpm install >> $LOG_FILE 2>&1
echo "" && echo "" >> $LOG_FILE 2>&1

echo "서버를 실행합니다. : $CURRENT_TIME" >> $LOG_FILE
$PM2_PATH start pnpm --name $NEW_NAME --no-autorestart -- start --port $NEW_PORT >> $LOG_FILE
echo "" && echo "" >> $LOG_FILE 2>&1

echo "Health Check를 수행합니다. : $CURRENT_TIME" >> $LOG_FILE
HEALTH_CHECK_SUCCESS=false
SUCCESS_COUNT=0 # 연속 성공 횟수 저장

for i in {1..20}; do
    echo "Health Check 시도 $i / 20" >> $LOG_FILE
    status_code=$(curl -s -o /dev/null -w "%{http_code}" http://$SERVER_IP:$NEW_PORT)
    echo "Health Check HTTP 상태 코드: $status_code" >> $LOG_FILE
    
    if [ "$status_code" -eq 200 ]; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo "Health Check 성공 ($SUCCESS_COUNT/2) : $CURRENT_TIME" >> $LOG_FILE
        
        if [ "$SUCCESS_COUNT" -eq 2 ]; then  # 2번 성공하면 통과
            echo "새로운 버전이 정상적으로 작동 중입니다. : $CURRENT_TIME" >> $LOG_FILE
            HEALTH_CHECK_SUCCESS=true
            break
        fi
    else
        SUCCESS_COUNT=0  # 실패하면 다시 0으로 리셋
        echo "Health Check 실패 (연속 성공 횟수 초기화) : $CURRENT_TIME" >> $LOG_FILE
    fi
    
    sleep 5
done

if [ $HEALTH_CHECK_SUCCESS = false ]; then
    echo "Health Check에 모두 실패해 배포를 중단합니다. : $CURRENT_TIME" >> $LOG_FILE
    $PM2_PATH delete $NEW_NAME >> $LOG_FILE 2>&1
    ln -sfn $PREVIOUS_RELEASE $SYMLINK_PATH

    FAIL_LOG=$(sed -n '/필요한 의존성을 설치합니다/,$p' $LOG_FILE | sed 's/"/\\"/g')

    if [ -x "$SLACK_SCRIPT" ]; then
        $SLACK_SCRIPT "배포 실패 (Rollback)" "Health Check 실패로 롤백되었습니다.\n\n*상세 로그:*\n\`\`\`$FAIL_LOG\`\`\`\n<@U089097D57X>" "fail"
    fi
    exit 1
fi

echo "" && echo "" >> $LOG_FILE 2>&1

echo "기존 서버($OLD_NAME)에 종료 요청을 보냅니다. (SIGTERM) : $CURRENT_TIME" >> $LOG_FILE
$PM2_PATH sendSignal SIGINT $OLD_NAME >> $LOG_FILE 2>&1

echo "Nginx 프록시 포트를 $CURRENT_PORT 에서 $NEW_PORT 로 변경합니다 : $CURRENT_TIME" >> $LOG_FILE
echo "set \$service_url http://$SERVER_IP:${NEW_PORT};" | sudo tee /etc/nginx/conf.d/service-url.inc
sudo nginx -s reload # graceful reload 마스터 프로세스에게 요청을 보내고 기존 워커 프로세스는 유지
echo "" && echo "" >> $LOG_FILE 2>&1

echo "기존 서버가 정상적으로 종료되도록 90초간 대기합니다. : $CURRENT_TIME" >> $LOG_FILE
sleep 90 # kill time 90초가 지나도 기존 요청이 마무리되지 않는다면 강제로 kill

echo "기존 서버를 종료합니다 : $CURRENT_TIME" >> $LOG_FILE
$PM2_PATH delete $OLD_NAME >> $LOG_FILE 2>&1

$SLACK_SCRIPT "배포 성공" "새로운 버전이 $NEW_PORT 포트에서 서비스 중입니다.\n<@U089097D57X>" "success"