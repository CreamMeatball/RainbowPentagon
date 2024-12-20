// app.js
import { createPentagonBoard } from './board.js';

document.addEventListener('DOMContentLoaded', () => {
    const boardData = createPentagonBoard('board');

    const colorSelect = document.getElementById('color-select');
    const logDiv = document.getElementById('log');

    // 클릭 이벤트: 클릭한 삼각형의 색상 변경
    const svg = document.getElementById('board');
    svg.addEventListener('click', (e) => {
        const target = e.target;
        if (target.tagName === 'polygon') {
            const cellId = target.getAttribute('data-cell-id');
            const selectedColor = colorSelect.value;
            target.setAttribute('fill', selectedColor);
            addLog(`${cellId}를 ${selectedColor}로 칠함`);
        }
    });

    // '로그 저장' 버튼 이벤트 리스너 추가
    const saveLogButton = document.getElementById('save-log-button');
    saveLogButton.addEventListener('click', () => {
        const svgElement = document.getElementById('board');
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(svgElement);

        // 외부 SVG가 포함된 경우 네임스페이스 추가
        if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }

        // 현재 시각 HHMM 형식으로 가져오기
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timestamp = `${hours}${minutes}`;

        // 파일명 설정
        const filename = `board_${timestamp}.svg`;

        // SVG 데이터를 Blob으로 변환
        const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        // 다운로드 링크 생성하여 자동 클릭
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    });

    function addLog(message) {
        const p = document.createElement('p');
        p.textContent = message;
        logDiv.appendChild(p);
        logDiv.scrollTop = logDiv.scrollHeight;
    }
});