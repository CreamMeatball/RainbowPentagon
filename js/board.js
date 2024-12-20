// board.js (라벨 정상화)
export function createPentagonBoard(svgElementId) {
    const svg = document.getElementById(svgElementId);
    const width = parseFloat(svg.getAttribute('width')) || 600;
    const height = parseFloat(svg.getAttribute('height')) || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const L = 60; 
    const cos36 = Math.cos(36 * Math.PI/180);
    const sin36 = Math.sin(36 * Math.PI/180);
    const h = L * cos36;        // 삼각형 높이
    const base = 2 * L * sin36; // 밑변

    const TRI_PATTERN = [1, 3, 5, 7, 9]; 
    const deltaX = base/2;

    function getOrientation(row, col) {
        return (col % 2 === 0) ? 'U' : 'D';
    }

    // 행별 시작 번호 계산
    // rowStart[i] = i행의 첫 삼각형 번호
    // 패턴: row0: 1개, row1: 3개, row2:5개, ...
    // rowStart[0] = 1
    // rowStart[1] = rowStart[0] + TRI_PATTERN[0] = 1 + 1 = 2
    // rowStart[2] = rowStart[1] + TRI_PATTERN[1] = 2 + 3 = 5
    // rowStart[3] = 5 + 5 = 10
    // rowStart[4] = 10 + 7 = 17
    const rowStart = [];
    {
        let sum = 0;
        for (let i=0; i<TRI_PATTERN.length; i++) {
            rowStart[i] = sum + 1;
            sum += TRI_PATTERN[i];
        }
    }

    const A_cells = [];
    for (let i = 0; i < TRI_PATTERN.length; i++) {
        const n = TRI_PATTERN[i];
        const totalWidth = (n - 1)*deltaX;
        const startX = -totalWidth/2;
        const rowY = i * h;

        for (let j = 0; j < n; j++) {
            const orientation = getOrientation(i,j);
            const cx = startX + j*deltaX;
            const cy = rowY;

            let pts;
            if (orientation === 'U') {
                pts = [
                    [cx, cy - h/2],
                    [cx - base/2, cy + h/2],
                    [cx + base/2, cy + h/2]
                ];
            } else {
                pts = [
                    [cx, cy + h/2],
                    [cx - base/2, cy - h/2],
                    [cx + base/2, cy - h/2]
                ];
            }

            A_cells.push({
                id: `A_${i}_${j}`,
                points: pts
            });
        }
    }

    function rotatePoints(points, angleDeg) {
        const angle = angleDeg * Math.PI/180;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        return points.map(([X,Y]) => {
            const nx = X*cosA - Y*sinA;
            const ny = X*sinA + Y*cosA;
            return [nx, ny];
        });
    }

    function translatePoints(points, dx, dy) {
        return points.map(([X,Y])=>[X+dx, Y+dy]);
    }

    // A를 center로 이동
    A_cells.forEach(c => {
        c.points = translatePoints(c.points, centerX, centerY);
    });

    const allCells = A_cells.map(c => ({id:c.id, owner:null, points:c.points}));

    const rotations = [72,144,216,288];
    const labels = ['B','C','D','E'];

    const rotationCenterX = centerX;
    const rotationCenterY = centerY - (h / 2);

    rotations.forEach((rot, idx) => {
        A_cells.forEach((c) => {
            const relative = c.points.map(([X, Y]) => [X - rotationCenterX, Y - rotationCenterY]);
            const rotated = rotatePoints(relative, rot);
            const finalPts = translatePoints(rotated, rotationCenterX, rotationCenterY);

            allCells.push({
                id: `${labels[idx]}_${c.id.substring(2)}`, // c.id: A_i_j -> substring(2): i_j
                owner: null,
                points: finalPts
            });
        });
    });

    // 라벨링: A,B,C,D,E 각각 25개씩 1~25 번호 부여
    allCells.forEach((cell, idx) => {
        const poly = document.createElementNS("http://www.w3.org/2000/svg","polygon");
        poly.setAttribute("points", cell.points.map(p=>p.join(',')).join(' '));
        poly.setAttribute("fill", "#fff");
        poly.setAttribute("stroke", "#000");
        poly.setAttribute("stroke-width", "1");
        poly.setAttribute("data-cell-id", cell.id);
        svg.appendChild(poly);
    
        // 삼각형 중심(무게중심)
        const cx = (cell.points[0][0] + cell.points[1][0] + cell.points[2][0]) / 3;
        const cy = (cell.points[0][1] + cell.points[1][1] + cell.points[2][1]) / 3;
    
        const text = document.createElementNS("http://www.w3.org/2000/svg","text");
        text.setAttribute("x", cx);
        text.setAttribute("y", cy);
        text.setAttribute("font-size", "10");
        text.setAttribute("font-family", "Arial, sans-serif");
        text.setAttribute("fill", "#000");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
    
        // 라벨명 계산
        // cell.id 예: "A_0_0", "B_3_2" 등
        const parts = cell.id.split('_');
        // parts[0] = "A" 또는 "B"...
        // parts[1] = i행
        // parts[2] = j열
        const alpha = parts[0];
        const iRow = parseInt(parts[1]);
        const jCol = parseInt(parts[2]);

        // 번호 = rowStart[iRow] + jCol
        const number = rowStart[iRow] + jCol;
        const labelName = `${alpha}${number}`;

        text.textContent = labelName;
        svg.appendChild(text);

        // 큰 점 그리기
        if (labelName === 'A17' || labelName === 'B17' || labelName === 'C17' || labelName === 'D17' || labelName === 'E17') {
            const colorMap = {
                'A': 'red',
                'B': 'yellow',
                'C': 'green',
                'D': 'blue',
                'E': 'purple'
            };
            const color = colorMap[alpha];
            const [x, y] = cell.points[1]; // 좌하단 꼭짓점 좌표

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", 5); // 큰 점의 반지름
            circle.setAttribute("fill", color);
            svg.appendChild(circle);
        }
    });

    return {
        cells: allCells.map(c=>({id:c.id, owner:c.owner})),
        redraw: function(newStates) {
            newStates.forEach(ns => {
                const poly = svg.querySelector(`polygon[data-cell-id='${ns.id}']`);
                if (poly) {
                    poly.setAttribute("fill", ns.owner ? ns.owner : "#fff");
                }
            });
        }
    };
}
