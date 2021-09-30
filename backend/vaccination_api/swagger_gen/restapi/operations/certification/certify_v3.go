// Code generated by go-swagger; DO NOT EDIT.

package certification

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the generate command

import (
	"net/http"

	"github.com/go-openapi/runtime/middleware"

	"github.com/divoc/api/swagger_gen/models"
)

// CertifyV3HandlerFunc turns a function with the right signature into a certify v3 handler
type CertifyV3HandlerFunc func(CertifyV3Params, *models.JWTClaimBody) middleware.Responder

// Handle executing the request and returning a response
func (fn CertifyV3HandlerFunc) Handle(params CertifyV3Params, principal *models.JWTClaimBody) middleware.Responder {
	return fn(params, principal)
}

// CertifyV3Handler interface for that can handle valid certify v3 params
type CertifyV3Handler interface {
	Handle(CertifyV3Params, *models.JWTClaimBody) middleware.Responder
}

// NewCertifyV3 creates a new http.Handler for the certify v3 operation
func NewCertifyV3(ctx *middleware.Context, handler CertifyV3Handler) *CertifyV3 {
	return &CertifyV3{Context: ctx, Handler: handler}
}

/*CertifyV3 swagger:route POST /v3/certify certification certifyV3

Certify the one or more vaccination

Certification happens asynchronously, this requires vaccinator authorization and vaccinator should be trained for the vaccination that is being certified. The payload for this API is compliant with DDCC core data set prescribed by WHO

*/
type CertifyV3 struct {
	Context *middleware.Context
	Handler CertifyV3Handler
}

func (o *CertifyV3) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	route, rCtx, _ := o.Context.RouteInfo(r)
	if rCtx != nil {
		r = rCtx
	}
	var Params = NewCertifyV3Params()

	uprinc, aCtx, err := o.Context.Authorize(r, route)
	if err != nil {
		o.Context.Respond(rw, r, route.Produces, route, err)
		return
	}
	if aCtx != nil {
		r = aCtx
	}
	var principal *models.JWTClaimBody
	if uprinc != nil {
		principal = uprinc.(*models.JWTClaimBody) // this is really a models.JWTClaimBody, I promise
	}

	if err := o.Context.BindValidRequest(r, route, &Params); err != nil { // bind params
		o.Context.Respond(rw, r, route.Produces, route, err)
		return
	}

	res := o.Handler.Handle(Params, principal) // actually handle the request

	o.Context.Respond(rw, r, route.Produces, route, res)

}
