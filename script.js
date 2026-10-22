const grid = document.querySelector('.grid');
const blockHeight = 30;
const blockWidth = 30;

const cols = Math.floor(grid.clientWidth/blockWidth);
const rows = Math.floor(grid.clientHeight/blockHeight);

for(let i =0; i<rows * cols; i++){
   const block = document.createElement('div');
   block.classList.add("block");
   grid.appendChild(block);
}