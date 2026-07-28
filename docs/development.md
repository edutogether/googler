# Development workflow

`main`은 배포 기준선, branch는 격리된 작업 공간, commit은 의미 있는 변경 기록, push는 원격 전송, Draft PR은 검토 중인 변경, merge는 main 반영, deploy는 서비스 반영이다. 작업은 main에서 branch를 만들고 `npm run check`을 통과한 뒤 작은 단위로 commit·push·Draft PR을 만든다. main 직접 변경, merge, 배포는 별도 승인 없이는 하지 않는다. 다른 형제 저장소에는 접근하지 않는다.
