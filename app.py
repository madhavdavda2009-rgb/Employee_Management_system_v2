from flask import Flask, render_template, request, redirect

app = Flask(__name__)

employees_list = []


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/employees", methods=["GET", "POST"])
def employees():

    if request.method == "POST":
        name = request.form["name"]
        department = request.form["department"]

        employee = {"name": name, "department": department}

        employees_list.append(employee)

        return redirect("/employees")

    return render_template("employees.html", employees=employees_list)


@app.route("/delete/<int:index>")
def delete_employee(index):

    if 0 <= index < len(employees_list):
        employees_list.pop(index)

    return redirect("/employees")


@app.route("/edit/<int:index>", methods=["GET", "POST"])
def edit_employee(index):

    if request.method == "POST":
        employees_list[index]["name"] = request.form["name"]
        employees_list[index]["department"] = request.form["department"]

        return redirect("/employees")

    employee = employees_list[index]

    return render_template("edit.html", employee=employee, index=index)


if __name__ == "__main__":
    app.run(debug=True)
