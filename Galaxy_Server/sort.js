/*function sort(list){   // list = [1,2,3,4]
   let sorted = []
   let truetable = []
   let next = 0
   let loader = 0
   while(loader != list.length){
      while(next != list.length){
        if(list[loader] >= list[next]){
           next++ 
           truetable.push(true)
        }
        else{
            truetable.push(false)
            break
        }
      }

      if(truetable.includes(false)){
        truetable.splice(0)
        loader++
        next = 0
      }
      else{
        sorted.push(list[loader])
        truetable.splice(0)
        list.splice(loader,1)
        next = 0
        loader = 0
      }
      if(list.length == 1){
        sorted.push(list[0])
        break
      }
   }

   return sorted
}

console.log(sort([1,2,3,4,5]))


*/
async function op(){
  console.log('Enter kj'); 
  await new Promise((resolve) => { 
      console.log('Promise created in kj'); 
      resolve(); 
  });
  queueMicrotask(()=>{console.log(3)})
  console.log('Microtask - kj complete'); 
}

async function p() {
  console.log("b") 
  await op() 
  console.log(3)  
}

async function l() {
  console.log(23) 
  await p() 
  p() 
  console.log(8) 
}

l()
console.log(2)

// 23 b ekj pro 2 mkj 3 b ekj pro 8 mkj 3 3 3

// (qu3 mkj) 3 (p,8)

//  3 3 3 

if(op == 9){
  while(op /9){
    switch(v == 9){
      case (9+8):
        console.log()
        
    }
  }
}