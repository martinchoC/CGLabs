class Object {
	constructor(objectSource) {
		this.source = objectSource;
		this.vaoSolid = null; //Geometry to render (stored in VAO).
        this.vaoWire = null;
		this.indexCountSolid = 0;
        this.indexCountWire = 0;
        this.modelMatrix = mat4.create(); // Indentity matrix
	}

	generateModel(pos_location, normal_location, texture_location) {
		let parsedOBJ = OBJParser.parseFile(this.source);
		let indicesSolid = parsedOBJ.indices;
		let indicesWire = Utils.reArrangeIndicesToRenderWithLines(parsedOBJ.indices);
		let positions = parsedOBJ.positions;
		let normals = parsedOBJ.normals;
		let textures = parsedOBJ.textures;
		//var may=0;
		//var min=0;

		this.may = positions[1];
		this.min = positions[1];
		for (var i = 4; i < positions.length; i= i + 3) {
			if (positions[i]> this.may){
				this.may = positions[i];
			}
			if (positions[i]< this.min){
				this.min = positions[i];
			}
		}
		
		let vertexAttributeInfoArray = [
			new VertexAttributeInfo(positions, pos_location, 3),
			new VertexAttributeInfo(normals, normal_location, 3),
			new VertexAttributeInfo(textures, texture_location, 2)
		];

		this.indexCountSolid = indicesSolid.length;
		this.indexCountWire = indicesWire.length;
		
		this.vaoSolid = VAOHelper.create(indicesSolid, vertexAttributeInfoArray);
		this.vaoWire = VAOHelper.create(indicesWire, vertexAttributeInfoArray);
	
		//Ya tengo los buffers cargados en memoria de la placa grafica, puedo borrarlo de JS
		parsedOBJ = null;
	}

	setModelMatrix(matrix) {
		this.modelMatrix = matrix;
	}

	draw(solid, gl, _gl) {
		// Set the model matrix of the object
		//gl.uniformMatrix4fv(u_modelMatrix, false, this.modelMatrix);

		// Draw object
		gl.uniform1f(u_ymax, this.may);
		gl.uniform1f(u_ymin, this.min);
		if (solid) {
			_gl.bindVertexArrayOES(this.vaoSolid);
			gl.drawElements(gl.TRIANGLES, this.indexCountSolid, gl.UNSIGNED_INT, 0);	
		} else {
			_gl.bindVertexArrayOES(this.vaoWire);
			gl.drawElements(gl.LINES, this.indexCountWire, gl.UNSIGNED_INT, 0);
		}
		
	}

}