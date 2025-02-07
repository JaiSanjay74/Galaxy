/*async function kj(){
   
    await new Promise((r,rj)=>{
        r()
    }
    )
    console.log(88)
}  

async function k(){
    console.log("pp")
    await kj()
    console.log(3)    
}

async function p() {
    k()
    await k()
    console.log(73)
}

p()
console.log(7)

// Micro task Queue   -   [88 3 ]
// Call Stack         -   [pp pp 7]

// Final Output       -   pp pp 7   

//  pp  */


async function kj(){
    console.log('Enter kj');
    await new Promise((resolve) => {
        console.log('Promise created in kj');
        resolve();
    });
    console.log('Microtask - kj complete');
}

async function k(){
    console.log('Enter k');
    await kj();
    console.log('Microtask - k complete');
}

async function p() {
    console.log('Enter p');
    k();
    k();
    console.log('Microtask - p complete');
}
 
p();
console.log('Synchronous - End of Main Code');

// ep ek ekj pro ek ekj pro sync


// mkj mkc mkj mkc mpc  
