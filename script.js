let parts = JSON.parse(localStorage.getItem("parts")) || [];
let editIndex = -1;

function addPart() {
    const name = document.getElementById("partName").value;
    const partNumber = document.getElementById("partNumber").value;
    const category = document.getElementById("partCategory").value;
    const price = document.getElementById("partPrice").value;
    const quantity = document.getElementById("partQuantity").value;

    if (name === "" || price === "" || quantity === "") {
        alert("Please fill in all fields");
        return;
    }

    const part = {
        name: name,
        partNumber: partNumber,
        category: category,
        price: Number(price),
        quantity: Number(quantity)
    };

    if (editIndex === -1) {
        parts.push(part);
    } else {
        parts[editIndex] = part;
        editIndex = -1;
        document.getElementById("addButton").innerHTML = "Add Part";
    }

    localStorage.setItem("parts", JSON.stringify(parts));

    document.getElementById("partName").value = "";
    document.getElementById("partNumber").value = "";
    document.getElementById("partCategory").value = "";
    document.getElementById("partPrice").value = "";
    document.getElementById("partQuantity").value = "";

    displayParts();
}

function displayParts() {
    let totalParts = parts.length;
    let lowStock = 0;
    let outOfStock = 0;
    let totalStock = 0;
    let totalValue = 0;

    parts.forEach(function(part) {
        totalStock += Number(part.quantity);
        totalValue += Number(part.quantity) * Number(part.price);

        if (Number(part.quantity) === 0) {
            outOfStock++;
        } else if (Number(part.quantity) <= 5) {
            lowStock++;
        }
    });

    document.getElementById("totalParts").textContent = totalParts;
    document.getElementById("lowStock").textContent = lowStock;
      
    document.getElementById("outOfStock").textContent = outOfStock;
    document.getElementById("totalStock").textContent = totalStock;
    document.getElementById("totalValue").textContent = totalValue;

    const list = document.getElementById("partsList");

    if (!list) {
        return;
    }

    let output = "";

    parts.forEach(function(part, index) {
        let status = "";

        if (Number(part.quantity) === 0) {
            status = "OUT OF STOCK";
        } else if (Number(part.quantity) <= 5) {
            status = "LOW STOCK";
        } else {
            status = "IN STOCK";
        }

        output += `
            <tr>
                <td>${part.name}</td>
                <td>${part.partNumber ||""}</td>
                <td>${part.category ||""}</td>
                <td>${part.price}</td>
                <td>${part.quantity}</td>
                <td>${status}</td>fF
                <td>
                    <button onclick="editPart(${index})">Edit</button>
                    <button onclick="deletePart(${index})">Delete</button>
                    <button onclick="stockIn(${index})">Stock In</button>
                    <button onclick="stockOut(${index})">Stock Out</button>

                </td>
            </tr>
        `;
    });

    list.innerHTML = output;
}

function editPart(index) {
    document.getElementById("partName").value = parts[index].name;
    document.getElementById("partNumber").value = parts[index].partNumber;
    document.getElementById("partCategory").value = parts[index].category || "";
    document.getElementById("partPrice").value = parts[index].price;
    document.getElementById("partQuantity").value = parts[index].quantity;

    editIndex = index;

    document.getElementById("addButton").innerHTML = "Update Part";
}

function deletePart(index) {
    parts.splice(index, 1);

    localStorage.setItem("parts", JSON.stringify(parts));

    displayParts();
}
function stockIn(index) {
    let amount = prompt("Enter quantity to add:");

    if (amount === null) {
        return;
    }

    amount = Number(amount);

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    parts[index].quantity = Number(parts[index].quantity) + amount;

    localStorage.setItem("parts", JSON.stringify(parts));

    displayParts();
}
function stockOut(index) {
    let amount = prompt("Enter quantity to remove:");

    if (amount === null) {
        return;
    }

    amount = Number(amount);

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    if (amount > Number(parts[index].quantity)) {
        alert("Not enough stock available.");
        return;
    }

    parts[index].quantity = Number(parts[index].quantity) - amount;

    localStorage.setItem("parts", JSON.stringify(parts));

    displayParts();
}
function searchParts() {
    const search = document.getElementById("searchPart").value.toLowerCase();

    const filteredParts = parts.filter(function(part) {
        return part.name.toLowerCase().includes(search) ||
       String(part.partNumber || "").toLowerCase().includes(search);
    });

    const list = document.getElementById("partsList");

    let output = "";

    filteredParts.forEach(function(part) {
    let status = "";

    if (Number(part.quantity) === 0) {
        status = "OUT OF STOCK";
    } else if (Number(part.quantity) <= 5) {
        status = "LOW STOCK";
    } else {
        status = "IN STOCK";
    }

    const index = parts.indexOf(part);

    output += `
        <tr>
            <td>${part.name}</td>
            <td>${part.partNumber || ""}</td>
            <td>${part.category || ""}</td>
            <td>${part.price}</td>
            <td>${part.quantity}</td>
            <td>${status}</td>
            <td>
                <button onclick="editPart(${index})">Edit</button>
                <button onclick="deletePart(${index})">Delete</button>
                <button onclick="stockIn(${index})">Stock In</button>
                <button onclick="stockOut(${index})">Stock Out</button>
            </td>
        </tr>
    `;
});

    list.innerHTML = output;
}
window.onload = function() {
    displayParts();
}
