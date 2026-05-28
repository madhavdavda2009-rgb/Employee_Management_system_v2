from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)


@app.route("/")
def home():
    connection = sqlite3.connect("employees.db")
    cursor = connection.cursor()
    cursor.execute("SELECT count(*) FROM employees")
    total_employees = cursor.fetchone()[0]
    connection.close()

    return render_template("index.html", total=total_employees)


@app.route("/employees", methods=["GET", "POST"])
def employees():

    connection = sqlite3.connect("employees.db")
    cursor = connection.cursor()

    if request.method == "POST":
        name = request.form["name"]
        department = request.form["department"]

        cursor.execute(
            "INSERT INTO employees (name, department) VALUES (?, ?)", (name, department)
        )

        connection.commit()

        return redirect("/employees")

    search = request.args.get("search")

    if search:
        cursor.execute(
            "SELECT * FROM employees WHERE name LIKE ?", ("%" + search + "%",)
        )

    else:
        cursor.execute("SELECT * FROM employees")

    employees_data = cursor.fetchall()

    connection.close()

    return render_template("employees.html", employees=employees_data)


@app.route("/delete/<int:id>")
def delete_employee(id):

    connection = sqlite3.connect("employees.db")
    cursor = connection.cursor()

    cursor.execute("DELETE FROM employees WHERE id = ?", (id,))

    connection.commit()

    connection.close()

    return redirect("/employees")


@app.route("/edit/<int:id>", methods=["GET", "POST"])
def edit_employee(id):

    connection = sqlite3.connect("employees.db")
    cursor = connection.cursor()

    if request.method == "POST":
        name = request.form["name"]
        department = request.form["department"]

        cursor.execute(
            "UPDATE employees SET name=?, department=? WHERE id=?",
            (name, department, id),
        )

        connection.commit()

        connection.close()

        return redirect("/employees")

    cursor.execute("SELECT * FROM employees WHERE id=?", (id,))

    employee = cursor.fetchone()

    connection.close()

    return render_template("edit.html", employee=employee)


if __name__ == "__main__":
    app.run(debug=True)
