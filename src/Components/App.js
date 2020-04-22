import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { NavBar } from "./NavBar.js";
import { useNavDropMenu } from "./Hooks/useNavDropMenu.js";
import { NavDropMenu } from "./NavDropMenu.js";
import { useModal } from "./Hooks/useModal.js"
import { Modal } from "./Modal.js"
import { useWs } from "./Hooks/useWs.js"
import { Loader } from "./Loader.js"

import { Alerts } from "./Alerts.js"
import { Pty } from "./Pty.js"

const StyledContentArea = styled.div`
	position: relative;
	z-index: 1;
	
	width: 120rem;
	height: 100vh;
	margin: 0 auto;
	
	display: grid;
	grid-template-columns: 32rem 86.5rem;
	grid-auto-rows: min-content;
	grid-gap: 1.5rem;
	
	padding-top: 8rem;
	
	& #content-area-main-display-content {
		position: relative;
	}	
`;

function App() {
	const ws = useWs();
	const modal = useModal();
	const ndm = useNavDropMenu();

	const doLogOut = async() => {
		ws.setJwt('^vAr^');
		ws.setUser(null);
		ws.setVerifiedJwt(null)
		ws.setValidCredentials(null);
		window.localStorage.removeItem('ManyangcloudJwt'); 
	}
	
	useEffect(() => {
		if(ws.rs === 1) {
			let storedJwt = window.localStorage.getItem('ManyangcloudJwt');
			if(storedJwt !== null) {
				let psjwt = JSON.parse(atob(storedJwt.split('.')[1]));
				let exp = new Date(psjwt['exp'] * 1000).toUTCString();
				let now = new Date(Date.now()).toUTCString();
				console.log(now);
				console.log(exp);
				if(exp > now) {
					console.log('Stored Jwt Good');
					ws.request(storedJwt,'validate-stored-jwt-token','noop');
				}
				if(exp < now) {
					ws.setLoading(false);
					window.localStorage.removeItem('ManyangcloudJwt'); 
				}
			} else if (storedJwt === null) {
				ws.setLoading(false);
			}
		}
	},[ws.rs]);

	useEffect(() => {
		ws.setValidCredentials(null);
	},[modal.modalShowing]);
	
	useEffect(() => {
		modal.setModalShowing(false);
	},[ws.toggleModal]);

	useEffect(() => {
		setTimeout(function () {
	        ws.setToastMsg("");
	    }, 5000);		
	},[ws.toastMsg]);	

	return (
		<>
			<NavBar { ...ndm } {...modal} loading={ws.loading} validjwt={ws.verifiedJwt} />
			<NavDropMenu { ...ndm } doLogOut={ doLogOut } />
			

			{  ws.loading === false &&
				<StyledContentArea onMouseEnter={(e) => {ndm.setNavDropMenuPosX(-320)}}>
					<div id="content-area-main-display-void"></div>
					<div id="content-area-main-display-header">		
						{	ws.toastMsg !== "" && 
							<Alerts type={ws.toastType} msg={ws.toastMsg} showIcon={true} />
						}	
					</div>	
					<div id="content-area-main-display-sidebar">
					</div>
					<div id="content-area-main-display-content">
						<Pty />
					</div>
				</StyledContentArea>
			}

			{ ws.loading === true && <Loader isPageLoad={true} /> }	

			{ modal.modalShowing && <Modal {...modal} validjwt={ws.verifiedJwt} validcreds={ws.validCredentials} request={ws.request} userAvail={ws.userAvail} setUserAvail={ws.setUserAvail} /> }
		</>
	);
}

if (document.getElementById("react_root")) {
	ReactDOM.render(<App />, document.getElementById("react_root"));
} 
