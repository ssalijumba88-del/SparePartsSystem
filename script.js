const supabaseUrl = "https://rqdarfipdywewgdsavsk.supabase.co";
const supabaseKey = "sb_publishable_kwf-2cqsUeaxAtQ_MxZ0mw_MTQja370";

const supabaseClient = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);
let parts = JSON.parse(localStorage.getItem("parts")) || [];
let editIndex = -1;

async function addPart() {
    const name = document.getElementById("partName").value;
    const partNumber = document.getElementById("partNumber").value;
    const category = document.getElementById("partCategory").value;
    const price = document.getElementById("partPrice").value;
    const quantity = document.getElementById("partQuantity").value;

    if (name === "" || price === "" || quantity === "") {
        alert("Please fill in all fields");
        return;
    }

    if (editIndex === -1) {

        const { error } = await supabaseClient
            .from("parts")
            .insert([
                {
                    name: name,
                    part_number: partNumber,
                    category: category,
                    price: Number(price),
                    quantity: Number(quantity)
                }
            ]);

        if (error) {
            console.error(error);
            alert("Error saving part to Supabase");
            return;
        }

    } else {

        const { error } = await supabaseClient
            .from("parts")
            .update({
                name: name,
                part_number: partNumber,
                category: category,
                price: Number(price),
                quantity: Number(quantity)
            })
            .eq("id", parts[editIndex].id);

        if (error) {
            console.error(error);
            alert("Error updating part in Supabase");
            return;
        }

        editIndex = -1;
        document.getElementById("addButton").innerHTML = "Add Part";
    }

    document.getElementById("partName").value = "";
    document.getElementById("partNumber").value = "";
    document.getElementById("partCategory").value = "";
    document.getElementById("partPrice").value = "";
    document.getElementById("partQuantity").value = "";

    await loadParts();
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
async function loadParts() {
    const { data, error } = await supabaseClient
        .from("parts")
        .select("*");

    if (error) {
        console.error(error);
        alert("Error loading parts from Supabase");
        return;
    }

    parts = data.map(function(part) {
        return {
            id: part.id,
            name: part.name,
            partNumber: part.part_number || "",
            category: part.category || "",
            price: Number(part.price) || 0,
            quantity: Number(part.quantity) || 0
        };
    });

    displayParts();
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
async function stockIn(index) {
    let amount = prompt("Enter quantity to add:");

    if (amount === null) {
        return;
    }

    amount = Number(amount);

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    const newQuantity = Number(parts[index].quantity) + amount;

    const { error } = await supabaseClient
        .from("parts")
        .update({ quantity: newQuantity })
        .eq("id", parts[index].id);

    if (error) {
        console.error(error);
        alert("Error updating stock.");
        return;
    }

    parts[index].quantity = newQuantity;

    displayParts();
}
async function stockOut(index) {
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

    const newQuantity = Number(parts[index].quantity) - amount;

    const { error } = await supabaseClient
        .from("parts")
        .update({ quantity: newQuantity })
        .eq("id", parts[index].id);

    if (error) {
        console.error("Stock Out error:", error);
        alert("Error updating stock in Supabase.");
        return;
    }

    parts[index].quantity = newQuantity;

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
    loadParts();
}
